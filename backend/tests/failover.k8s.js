// Chaos test for the k3d cluster: connect users through the Ingress, delete one backend pod the
// way a real failure (or a node drain) would remove it, and check what Kubernetes and the app do.
//
//   kubectl apply -k k8s/overlays/local   (or ./scripts/k8s-up.sh)
//   node tests/failover.k8s.js
//
// Two things are being tested at once:
//   1. Kubernetes' job: a replacement pod appears (the Deployment keeps its replica count).
//   2. The app's job: users who were on the deleted pod reconnect, and land on a pod that's up.
//
// Not a *.test.js suite: it deletes a pod via kubectl, so it only runs against a real cluster.
const { execSync } = require('child_process');
const { io } = require('socket.io-client');
const { check, register, run } = require('./lib');

const BASE = process.env.BASE || 'http://localhost:8080';
const NS = process.env.NAMESPACE || 'chatscale';
const USERS = 10;
const kubectl = (args) => execSync(`kubectl -n ${NS} ${args}`, { stdio: 'pipe' }).toString();

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
    socket.on('disconnect', (reason) => {
      client.lostAt = Date.now();
      client.reason = reason;
      if (reason === 'io server disconnect') setTimeout(() => socket.connect(), 500 + Math.random() * 2000);
    });
  });

// kubectl prints "pod/<name>"; the app's hostname (used as the "which copy" id) is just "<name>"
const bareName = (podName) => podName.replace(/^pod\//, '');
const listBackendPods = () => kubectl('get pods -l app=backend -o name').trim().split('\n').filter(Boolean).map(bareName);

run(async () => {
  const podsBefore = listBackendPods();
  check('two backend pods running before the test', podsBefore.length === 2, podsBefore.join(', '));

  const users = [];
  for (let i = 0; i < USERS; i++) users.push(await register(`k8sfo${i}`, BASE));
  const clients = await Promise.all(users.map((u) => connectLikeTheApp(u.token)));

  // Each client's "copy" is its pod name — pick whichever pod has at least one user on it
  const byPod = {};
  clients.forEach((c) => (byPod[c.copies[0]] = (byPod[c.copies[0]] || []).concat(c)));
  const pods = Object.keys(byPod);
  check('users landed on both pods', pods.length === 2, pods.join(', '));
  const target = pods[0];
  const victims = byPod[target];
  const bystanders = clients.filter((c) => !victims.includes(c));
  console.log(`before: ${victims.length} users on ${target}, ${bystanders.length} on the other pod`);

  const started = Date.now();
  kubectl(`delete pod ${target} --wait=false`);
  console.log(`kubectl delete pod ${target}: issued at +0s`);

  // Kubernetes should notice the pod is gone and schedule a replacement within a few seconds
  let replaced = false;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const pods = listBackendPods();
    if (pods.length === 2 && !pods.includes(target)) {
      replaced = true;
      console.log(`replacement pod present after ${i + 1}s: ${pods.join(', ')}`);
      break;
    }
  }
  check('Kubernetes replaced the deleted pod', replaced);

  await new Promise((resolve) => setTimeout(resolve, 8000));

  check("users on the other pod weren't disconnected", bystanders.every((c) => !c.lostAt), `${bystanders.filter((c) => c.lostAt).length} disconnected`);
  check('every user of the deleted pod reconnected', victims.every((c) => c.backAt), `${victims.filter((c) => c.backAt).length}/${victims.length}`);
  check('…to a pod that is still running', victims.every((c) => c.copies.at(-1) !== target));
  const gaps = victims.filter((c) => c.backAt).map((c) => c.backAt - c.lostAt).sort((a, b) => a - b);
  if (gaps.length) console.log(`time without a connection: ${gaps[0]}–${gaps.at(-1)} ms`);

  clients.forEach((c) => c.socket.close());

  console.log('waiting for the Deployment to reach 2/2 ready...');
  kubectl('rollout status deployment/backend --timeout=120s');
  console.log(`total time to fully heal: ${((Date.now() - started) / 1000).toFixed(1)}s`);
});
