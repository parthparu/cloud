// Tiny helpers shared by the API test suites. No test framework: each suite is a plain script that
// prints PASS/FAIL lines and exits non-zero if anything failed, so it runs anywhere Node does.
//
// Point the suites at a running backend with BASE (default: the docker compose stack on :8080).
// Never point them at a backend that uses a real database such as Supabase — they create users.
const { io } = require('socket.io-client');

const BASE = process.env.BASE || 'http://localhost:8080';

// Unique per run, so suites can be repeated against the same database
const RUN = Math.random().toString(36).slice(2, 7);
const uname = (name) => `t_${name}_${RUN}`;

let failures = 0;
const check = (label, condition, detail = '') => {
  if (!condition) failures += 1;
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}${detail ? '  ' + detail : ''}`);
};

const call = async (method, path, token, body, base = BASE) => {
  const response = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
};

const register = async (name, base = BASE) => {
  const username = uname(name);
  const { body } = await call('POST', '/api/auth/register', null, { username, email: `${username}@test.local`, password: 'longenough1' }, base);
  return { username, email: `${username}@test.local`, password: 'longenough1', token: body.token };
};

// Resolves to [socket, instanceName] once the server has said hello
const connect = (token, base = BASE) =>
  new Promise((resolve, reject) => {
    const socket = io(base, { auth: { token }, transports: ['websocket'], reconnection: false });
    socket.on('session:ready', (info) => resolve([socket, info.node]));
    socket.on('connect_error', reject);
  });

const emit = (socket, event, data) => new Promise((resolve) => socket.emit(event, data, resolve));
const within = (promise, ms) => Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);
const once = (socket, event, ms = 2000) => within(new Promise((resolve) => socket.once(event, resolve)), ms);

const finish = () => {
  console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
  process.exit(failures ? 1 : 0);
};

const run = (fn) =>
  fn()
    .then(finish)
    .catch((error) => {
      console.error('CRASH', error);
      process.exit(1);
    });

module.exports = { BASE, RUN, uname, check, call, register, connect, emit, once, within, run };
