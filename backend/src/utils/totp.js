// Time-based one-time passwords (RFC 6238) — the 6-digit codes authenticator apps show.
// Built on node:crypto so there is no third-party dependency in the login path.
const crypto = require('crypto');

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;
// Accept the previous and next 30-second step too, to tolerate clock drift between phone and server
const DRIFT_STEPS = 1;

const base32Encode = (buffer) => {
  let bits = '';
  for (const byte of buffer) bits += byte.toString(2).padStart(8, '0');
  let output = '';
  for (let i = 0; i < bits.length; i += 5) {
    output += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)];
  }
  return output;
};

const base32Decode = (text) => {
  let bits = '';
  for (const char of text.replace(/=+$/, '').toUpperCase()) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) throw new Error('Invalid base32 character');
    bits += value.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
};

// 20 random bytes = 160 bits, the size RFC 4226 recommends for HMAC-SHA1
exports.generateSecret = () => base32Encode(crypto.randomBytes(20));

const codeForStep = (secret, step) => {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = crypto.createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
};

const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP_SECONDS);

exports.generateCode = (secret, now = Date.now()) => codeForStep(secret, currentStep(now));

// Returns the matching time step, or null. Callers store the step to stop the same code being reused.
exports.verifyCode = (secret, code, now = Date.now()) => {
  const candidate = String(code || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(candidate)) return null;

  const step = currentStep(now);
  for (let offset = -DRIFT_STEPS; offset <= DRIFT_STEPS; offset++) {
    const expected = codeForStep(secret, step + offset);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(candidate))) {
      return step + offset;
    }
  }
  return null;
};

exports.otpauthUrl = ({ secret, accountName, issuer }) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}` +
  `?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
