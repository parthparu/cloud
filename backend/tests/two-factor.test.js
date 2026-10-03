// Two-step verification: setup, sign-in with codes, recovery codes, limits, turning it off.
// With several backend copies, the per-account lockout check passes only if the copies share
// their counters (Redis) — which is exactly what it is meant to catch.
const totp = require('../src/utils/totp');
const { check, call, register, connect, run } = require('./lib');

const connects = (token) => connect(token).then(([socket]) => { socket.close(); return true; }, () => false);
// A code from a later 30-second window, so it's never one that was already used
const futureCode = (secret, windows) => totp.generateCode(secret, Date.now() + windows * 30000);

run(async () => {
  const user = await register('mfa');
  const login = () => call('POST', '/api/auth/login', null, { email: user.email, password: user.password });
  const verify = (challengeToken, code) => call('POST', '/api/auth/login/2fa', null, { challengeToken, code });

  let r = await call('GET', '/api/auth/2fa', user.token);
  check('off by default', r.body.enabled === false);
  r = await call('POST', '/api/auth/2fa/setup', user.token);
  check('setup returns a secret and a QR code', r.status === 200 && r.body.secret.length === 32 && r.body.qrCode.startsWith('data:image/png'));
  const secret = r.body.secret;
  check('otpauth link names the app and account', r.body.otpauthUrl.startsWith('otpauth://totp/ChatScale:'));
  check('enable rejects a wrong code', (await call('POST', '/api/auth/2fa/enable', user.token, { code: '000000' })).status === 400);
  r = await call('POST', '/api/auth/2fa/enable', user.token, { code: totp.generateCode(secret) });
  check('enable with the right code returns 10 recovery codes', r.status === 200 && r.body.recoveryCodes.length === 10);
  const recovery = r.body.recoveryCodes;
  check('/auth/me shows 2FA on', (await call('GET', '/api/auth/me', user.token)).body.user.twoFactorEnabled === true);

  r = await login();
  check('password alone gives a challenge, not a session', r.body.twoFactorRequired === true && !r.body.token);
  const challenge = r.body.challengeToken;
  check('challenge token refused by the API', (await call('GET', '/api/auth/me', challenge)).status === 401);
  check('challenge token refused by the socket', (await connects(challenge)) === false);
  r = await verify(challenge, '123456');
  check('wrong code shows tries left', r.status === 400 && /4 tries left/.test(r.body.message), r.body.message);
  const code = futureCode(secret, 1);
  r = await verify(challenge, code);
  check('right code gives a session', r.status === 200 && !!r.body.token);
  check('that session works on the socket', await connects(r.body.token));

  const challenge2 = (await login()).body.challengeToken;
  r = await verify(challenge2, code);
  check('a code cannot be used twice', r.status === 400 && /just used/.test(r.body.message), r.body.message);
  r = await verify(challenge2, recovery[0].toUpperCase());
  check('recovery code works (any case)', r.status === 200);
  const session = r.body.token;

  const challenge3 = (await login()).body.challengeToken;
  check('each recovery code works once', (await verify(challenge3, recovery[0])).status === 400);
  check('9 recovery codes left', (await call('GET', '/api/auth/2fa', session)).body.recoveryCodesRemaining === 9);
  for (let i = 0; i < 4; i++) await verify(challenge3, '111111');
  r = await verify(challenge3, '111111');
  check('5 wrong codes end the sign-in attempt', r.status === 429 && r.body.restart === true);

  // 6 wrong so far on this account; 4 more on a fresh attempt reach the per-account limit of 10
  const challenge4 = (await login()).body.challengeToken;
  for (let i = 0; i < 4; i++) await verify(challenge4, '222222');
  r = await verify(challenge4, futureCode(secret, 2));
  check('per-account lockout blocks even a right code', r.status === 429, r.body.message);
  check('a forged challenge is refused', (await verify('garbage', '123456')).status === 401);

  check('turning off needs the password', (await call('POST', '/api/auth/2fa/disable', session, { password: 'wrong', code: recovery[1] })).status === 400);
  r = await call('POST', '/api/auth/2fa/recovery-codes', session, { password: user.password, code: recovery[1] });
  check('regenerate recovery codes', r.status === 200 && r.body.recoveryCodes.length === 10);
  r = await call('POST', '/api/auth/2fa/disable', session, { password: user.password, code: r.body.recoveryCodes[0] });
  check('turn off with password + code', r.status === 200);
  r = await login();
  check('sign-in is one step again', !!r.body.token && !r.body.twoFactorRequired);
});
