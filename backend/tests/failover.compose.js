// Failover check for the docker compose stack: connect users through the load balancer, stop one
// backend copy the way Docker/Kubernetes would (SIGTERM), and measure what happens to its users.
//
//   docker compose up -d        (from the project root)
//   node tests/failover.compose.js [backend-a|backend-b]
//
// Not a *.test.js suite: it stops and restarts a container, so it only runs against compose.
const path = require('path');
const { execSync } = require('child_process');
const { io } = require('socket.io-client');
const { check, register, run } = require('./lib');

const BASE = process.env.BASE || 'http://localhost:8080';
const SERVICE = process.argv[2] || 'backend-a';
const USERS = 10;
const compose = (args) =>
  execSync(`docker compose -f ${path.join(__dirname, '../../compose.yaml')} ${args}`, { stdio: 'pipe' }).toString();

// Mirrors the browser app's connection settings (frontend/src/lib/socket.js)
const connectLikeTheApp = (token) =>
  new Promise((resolve) => {
    const client = { copies: [], lostAt: null, backAt: null, reason: null };
    const socket = io(BASE, { auth: { token }, transports: ['websocket'], reconnectionDelay: 1000, reconnectionDelayMax: 8000 });
    client.socket = socket;
    socket.on('session:ready', ({ node }) => {
      client.copies.push(node);
      if (client.lostAt && !client.backAt) client.backAt = Date.now();
      if (client.copies.length === 1) resolve(client);
    });
    client.events = [];
    socket.io.on('reconnect_attempt', (n) => client.events.push(`attempt${n}@${Date.now() % 100000}`));
    socket.io.on('reconnect_error', (e) => client.events.push(`error:${e.message}${e.description ? '(' + (e.description.message || e.description) + ')' : ''}`));
    socket.on('connect_error', (e) => client.events.push(`connect_error:${e.message}`));
    socket.on('disconnect', (reason) => {
      client.lostAt = Date.now();
      client.reason = reason;
      if (reason === 'io server disconnect') setTimeout(() => socket.connect(), 500 + Math.random() * 2000);
    });
  });

run(async () => {
  const stoppingCopy = SERVICE === 'backend-a' ? 'copy-A' : 'copy-B';
  const users = [];
  for (let i = 0; i < USERS; i++) users.push(await register(`fo${i}`, BASE));
  const clients = await Promise.all(users.map((u) => connectLikeTheApp(u.token)));
  const on = (copy) => clients.filter((c) => c.copies.at(-1) === copy);

  const victims = on(stoppingCopy);
  const bystanders = clients.filter((c) => !victims.includes(c));
  console.log(`before: ${victims.length} users on ${stoppingCopy}, ${bystanders.length} on the other copy`);
  check('users are spread across both copies', victims.length > 0 && bystanders.length > 0);

  const started = Date.now();
  compose(`stop ${SERVICE}`);
  const stopSeconds = (Date.now() - started) / 1000;
  console.log(`docker compose stop ${SERVICE}: ${stopSeconds.toFixed(1)} s`);
  await new Promise((resolve) => setTimeout(resolve, 8000));

  const logs = compose(`logs ${SERVICE} --since 60s`);
  check('the copy stopped cleanly (no forced exit)', /stopped cleanly/.test(logs) && !/forcing exit/.test(logs), stopSeconds.toFixed(1) + ' s');
  check("users on the other copy weren't disconnected", bystanders.every((c) => !c.lostAt), `${bystanders.filter((c) => c.lostAt).length} disconnected`);
  check("every user of the stopped copy reconnected", victims.every((c) => c.backAt), `${victims.filter((c) => c.backAt).length}/${victims.length}`);
  check('…to the copy that is still running', victims.every((c) => c.copies.at(-1) !== stoppingCopy));
  if (process.env.DEBUG) victims.forEach((c) => console.log('  victim', c.reason, c.lostAt ? c.lostAt - started : null, c.backAt ? c.backAt - started : null, c.copies.join('>'), c.events.join(' ')));
  const gaps = victims.filter((c) => c.backAt).map((c) => c.backAt - c.lostAt).sort((a, b) => a - b);
  if (gaps.length) console.log(`time without a connection: ${gaps[0]}–${gaps.at(-1)} ms (reason: ${[...new Set(victims.map((c) => c.reason))].join(', ')})`);

  clients.forEach((c) => c.socket.close());
  compose(`start ${SERVICE}`);
  console.log(`${SERVICE} started again`);
});
