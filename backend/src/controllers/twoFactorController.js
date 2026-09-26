const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const twoFactorService = require('../services/twoFactorService');
const userService = require('../services/userService');
const secretBox = require('../utils/secretBox');
const tokens = require('../utils/tokens');
const counters = require('../utils/counters');
const { toSessionUser } = require('./authController');

const ISSUER = 'ChatScale';
const MAX_ATTEMPTS_PER_CHALLENGE = 5;
const REUSED_MESSAGE = 'That code was just used. Wait for your app to show a new one.';

// Wrong-code limits. Counters are shared through Redis when it's configured (utils/counters.js),
// so every copy of the backend enforces the same budget.
const MAX_FAILURES_PER_USER = 10;
const USER_WINDOW_SECONDS = 15 * 60;
const challengeKey = (jti) => `2fa:challenge:${jti}`;
const userKey = (userId) => `2fa:user:${userId}`;

const requireConfigured = (res) => {
  if (secretBox.isConfigured()) return true;
  res.status(503).json({ message: 'Two-factor authentication is not configured on this server' });
  return false;
};

// GET /auth/2fa
exports.getStatus = async (req, res, next) => {
  try {
    res.status(200).json(await twoFactorService.getStatus(req.user.id));
  } catch (error) {
    next(error);
  }
};

// POST /auth/2fa/setup — new secret + QR code; 2FA stays off until a code is confirmed
exports.beginSetup = async (req, res, next) => {
  try {
    if (!requireConfigured(res)) return;
    if (await twoFactorService.isEnabled(req.user.id)) {
      return res.status(400).json({ message: 'Two-factor authentication is already on' });
    }

    const [user] = await userService.getUserById(req.user.id);
    const { secret, otpauthUrl } = await twoFactorService.beginSetup(req.user.id, user.Email, ISSUER);
    const qrCode = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 });

    res.status(200).json({ secret, otpauthUrl, qrCode });
  } catch (error) {
    next(error);
  }
};

// POST /auth/2fa/enable { code } — confirms the app is set up, returns recovery codes once
exports.enable = async (req, res, next) => {
  try {
    if (!requireConfigured(res)) return;
    if (await twoFactorService.isEnabled(req.user.id)) {
      return res.status(400).json({ message: 'Two-factor authentication is already on' });
    }

    const result = await twoFactorService.verifyTotp(req.user.id, req.body.code);
    if (result !== true) {
      return res.status(400).json({
        message: result === twoFactorService.REUSED ? REUSED_MESSAGE : "That code didn't match. Check your authenticator app and try again."
      });
    }

    const recoveryCodes = await twoFactorService.enable(req.user.id);
    res.status(200).json({ enabled: true, recoveryCodes });
  } catch (error) {
    next(error);
  }
};

// Password plus a current code (or recovery code) — needed to weaken or reset 2FA
const confirmIdentity = async (userId, password, code) => {
  const hash = await twoFactorService.getPasswordHash(userId);
  if (!hash || !(await bcrypt.compare(String(password || ''), hash))) {
    return 'Your password is incorrect';
  }
  const result = await twoFactorService.verifyAnyCode(userId, code);
  if (result !== true) {
    return result === twoFactorService.REUSED ? REUSED_MESSAGE : "That code didn't match";
  }
  return null;
};

// POST /auth/2fa/disable { password, code }
exports.disable = async (req, res, next) => {
  try {
    if (!(await twoFactorService.isEnabled(req.user.id))) {
      return res.status(400).json({ message: 'Two-factor authentication is already off' });
    }

    const problem = await confirmIdentity(req.user.id, req.body.password, req.body.code);
    if (problem) return res.status(400).json({ message: problem });

    await twoFactorService.disable(req.user.id);
    res.status(200).json({ enabled: false });
  } catch (error) {
    next(error);
  }
};

// POST /auth/2fa/recovery-codes { password, code } — replaces all recovery codes
exports.regenerateRecoveryCodes = async (req, res, next) => {
  try {
    if (!(await twoFactorService.isEnabled(req.user.id))) {
      return res.status(400).json({ message: 'Turn on two-factor authentication first' });
    }

    const problem = await confirmIdentity(req.user.id, req.body.password, req.body.code);
    if (problem) return res.status(400).json({ message: problem });

    res.status(200).json({ recoveryCodes: await twoFactorService.regenerateRecoveryCodes(req.user.id) });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login/2fa { challengeToken, code } — second step of sign-in
exports.completeLogin = async (req, res, next) => {
  try {
    let challenge;
    try {
      challenge = tokens.verifyChallengeToken(req.body.challengeToken);
    } catch {
      return res.status(401).json({ message: 'Your sign-in expired. Enter your password again.', restart: true });
    }

    if ((await counters.get(userKey(challenge.id))) >= MAX_FAILURES_PER_USER) {
      return res.status(429).json({ message: 'Too many wrong codes. Wait 15 minutes, then sign in again.', restart: true });
    }

    const previous = await counters.get(challengeKey(challenge.jti));
    if (previous >= MAX_ATTEMPTS_PER_CHALLENGE) {
      return res.status(429).json({ message: 'Too many wrong codes. Enter your password again.', restart: true });
    }

    const result = await twoFactorService.verifyAnyCode(challenge.id, req.body.code);
    // A reused code proves the user holds the app, so it doesn't count against their tries
    if (result === twoFactorService.REUSED) {
      return res.status(400).json({ message: REUSED_MESSAGE });
    }
    if (result !== true) {
      await counters.increment(userKey(challenge.id), USER_WINDOW_SECONDS);
      const count = await counters.increment(challengeKey(challenge.jti), challenge.exp - Date.now() / 1000);
      const left = MAX_ATTEMPTS_PER_CHALLENGE - count;
      return res.status(400).json({
        message: left > 0 ? `That code didn't match. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong codes. Enter your password again.',
        restart: left <= 0,
      });
    }

    await counters.reset(challengeKey(challenge.jti));
    const [user] = await userService.getUserById(challenge.id);
    await userService.updateUser(user.UserID, { LastLoginDate: new Date(), OnlineStatus: 'Online' });

    res.status(200).json({
      message: 'Login successful',
      token: tokens.signAccessToken(user.UserID),
      user: toSessionUser(user),
    });
  } catch (error) {
    next(error);
  }
};
