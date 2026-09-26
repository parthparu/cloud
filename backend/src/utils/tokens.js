// All JWT handling in one place. Two kinds of token exist:
//   access    — a signed-in session (30 days)
//   challenge — "password was correct, waiting for the 2FA code" (5 minutes); grants no access
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_TTL = '30d';
const CHALLENGE_TTL = '5m';

const secret = () => process.env.JWT_SECRET;

exports.signAccessToken = (userId) => jwt.sign({ id: userId }, secret(), { expiresIn: ACCESS_TTL });

// Throws on anything that is not a valid access token — including challenge tokens
exports.verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, secret());
  if (decoded.typ) {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';
    throw error;
  }
  return decoded;
};

exports.signChallengeToken = (userId) =>
  jwt.sign({ id: userId, typ: '2fa', jti: crypto.randomUUID() }, secret(), { expiresIn: CHALLENGE_TTL });

exports.verifyChallengeToken = (token) => {
  const decoded = jwt.verify(token, secret());
  if (decoded.typ !== '2fa') {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';
    throw error;
  }
  return decoded;
};
