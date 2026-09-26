const crypto = require('crypto');
const db = require('../config/db');
const totp = require('../utils/totp');
const secretBox = require('../utils/secretBox');

const RECOVERY_CODE_COUNT = 10;
// No 0/o/1/l/i so codes survive being read aloud or handwritten
const RECOVERY_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

const normaliseRecoveryCode = (code) => String(code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const hashRecoveryCode = (code) => crypto.createHash('sha256').update(normaliseRecoveryCode(code)).digest('hex');

const randomRecoveryCode = () => {
  const chars = Array.from(crypto.randomBytes(10), (byte) => RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET.length]);
  return `${chars.slice(0, 5).join('')}-${chars.slice(5).join('')}`;
};

const getRow = async (userId) => {
  const [rows] = await db.execute(
    'SELECT UserID, Email, Password, TwoFactorSecret, TwoFactorEnabled, TwoFactorLastStep FROM Users WHERE UserID = ?',
    [userId]
  );
  return rows[0] || null;
};

exports.getStatus = async (userId) => {
  const user = await getRow(userId);
  const [rows] = await db.execute(
    'SELECT COUNT(*) AS remaining FROM RecoveryCodes WHERE UserID = ? AND UsedAt IS NULL',
    [userId]
  );
  return {
    enabled: Boolean(user?.TwoFactorEnabled),
    recoveryCodesRemaining: Number(rows[0].remaining),
  };
};

exports.isEnabled = async (userId) => Boolean((await getRow(userId))?.TwoFactorEnabled);

// Start setup: store a new (not yet enabled) secret and return what the authenticator app needs
exports.beginSetup = async (userId, accountName, issuer) => {
  const secret = totp.generateSecret();
  await db.execute('UPDATE Users SET TwoFactorSecret = ?, TwoFactorEnabled = 0 WHERE UserID = ?', [
    secretBox.seal(secret),
    userId,
  ]);
  return { secret, otpauthUrl: totp.otpauthUrl({ secret, accountName, issuer }) };
};

// A correct code that was already accepted once. Reported separately so the user is told to
// wait for the next code rather than that the code is wrong.
exports.REUSED = 'reused';

// Check a 6-digit code against the stored secret: true, false, or REUSED
exports.verifyTotp = async (userId, code) => {
  const user = await getRow(userId);
  if (!user?.TwoFactorSecret) return false;

  const step = totp.verifyCode(secretBox.open(user.TwoFactorSecret), code);
  if (step === null) return false;
  if (user.TwoFactorLastStep !== null && step <= user.TwoFactorLastStep) {
    return exports.REUSED;
  }

  await db.execute('UPDATE Users SET TwoFactorLastStep = ? WHERE UserID = ?', [step, userId]);
  return true;
};

// Spend a recovery code; each works exactly once
exports.useRecoveryCode = async (userId, code) => {
  const [result] = await db.execute(
    'UPDATE RecoveryCodes SET UsedAt = ? WHERE UserID = ? AND CodeHash = ? AND UsedAt IS NULL',
    [new Date(), userId, hashRecoveryCode(code)]
  );
  return result.affectedRows > 0;
};

// Accepts either an authenticator code or a recovery code: true, false, or REUSED
exports.verifyAnyCode = async (userId, code) => {
  const compact = String(code || '').replace(/\s+/g, '');
  if (/^\d{6}$/.test(compact)) return exports.verifyTotp(userId, compact);
  return exports.useRecoveryCode(userId, code);
};

// Replace all recovery codes; the plain codes are returned once and only hashes are kept
exports.regenerateRecoveryCodes = async (userId) => {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, randomRecoveryCode);
  await db.execute('DELETE FROM RecoveryCodes WHERE UserID = ?', [userId]);
  for (const code of codes) {
    await db.execute('INSERT INTO RecoveryCodes (UserID, CodeHash) VALUES (?, ?)', [userId, hashRecoveryCode(code)]);
  }
  return codes;
};

exports.enable = async (userId) => {
  await db.execute('UPDATE Users SET TwoFactorEnabled = 1 WHERE UserID = ?', [userId]);
  return exports.regenerateRecoveryCodes(userId);
};

exports.disable = async (userId) => {
  await db.execute(
    'UPDATE Users SET TwoFactorEnabled = 0, TwoFactorSecret = NULL, TwoFactorLastStep = NULL WHERE UserID = ?',
    [userId]
  );
  await db.execute('DELETE FROM RecoveryCodes WHERE UserID = ?', [userId]);
};

exports.getPasswordHash = async (userId) => (await getRow(userId))?.Password;
