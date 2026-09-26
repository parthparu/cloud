// Encrypts small secrets (TOTP keys) before they are stored, with AES-256-GCM.
// The key comes from TWO_FACTOR_KEY so a copied database alone cannot generate anyone's codes.
const crypto = require('crypto');

const getKey = () => {
  const raw = process.env.TWO_FACTOR_KEY;
  // Refuse missing, short, or copied-from-.env.example values
  if (!raw || raw.length < 32 || raw.startsWith('change-me')) {
    throw new Error('TWO_FACTOR_KEY is not set (see backend/.env.example)');
  }
  // Normalise any sufficiently long string to exactly 32 bytes
  return crypto.createHash('sha256').update(raw).digest();
};

exports.isConfigured = () => {
  try {
    getKey();
    return true;
  } catch {
    return false;
  }
};

// Output format: base64(iv).base64(authTag).base64(ciphertext)
exports.seal = (plaintext) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((b) => b.toString('base64')).join('.');
};

exports.open = (sealed) => {
  const [iv, tag, ciphertext] = sealed.split('.').map((part) => Buffer.from(part, 'base64'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
};
