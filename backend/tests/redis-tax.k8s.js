// Measures the Redis fix's cost (PLAN.md Phase 6, "the Redis tax"): end-to-end message delivery
// latency when sender and receiver land on the SAME backend pod (one process, io.to().emit(),
// no Redis involved at all) versus DIFFERENT pods (through Redis pub/sub — the fix from CHG-0023).
// cross-copy.test.js already proves cross-pod delivery *works*; this measures what it *costs*.
//
// Needs REDIS_URL on (the normal/fixed mode) and at least 2 backend pods, so both pairings exist
// to find. Not a *.test.js suite: it reports a distribution, not pass/fail, so it's run directly.
//
//   kubectl -n chatscale get pods -l app=backend          (confirm >=2 pods)
//   BASE=http://localhost:8080 node tests/redis-tax.k8s.js
//   SAMPLES=100 node tests/redis-tax.k8s.js               (more samples, tighter percentiles)
const { check, call, register, connect, emit, once, run, BASE } = require('./lib');

const SAMPLES = Number(process.env.SAMPLES || 50);
const WARMUP = 5;

const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
const stats = (samples) => {
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    n: sorted.length,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
    max: sorted[sorted.length - 1],
  };
};

// Sequential, one message at a time: each send waits for the receiver's arrival before the next
// send, so samples are clean round-trip latencies, not muddied by concurrent in-flight messages.
const measure = async (senderSocket, receiverSocket, channelId, n) => {
  const samples = [];
  for (let i = 0; i < n; i++) {
    const arrival = once(receiverSocket, 'message:new', 2000);
    const sentAt = Date.now();
    await emit(senderSocket, 'message:send', { channelId, content: `tax-check ${i}`, sentAt });
    const message = await arrival;
    if (message) samples.push(Date.now() - sentAt);
  }
  return samples;
};

run(async () => {
  const alice = await register('taxa');
  const bob = await register('taxb');
  const spaceId = (await call('POST', '/api/servers', alice.token, { serverName: 'Redis Tax' })).body.server.id;
  const code = (await call('POST', `/api/servers/${spaceId}/invites`, alice.token)).body.invite.code;
  await call('POST', '/api/servers/join', bob.token, { inviteCode: code });
  const channelId = (await call('GET', `/api/channels/servers/${spaceId}`, alice.token)).body.channels[0].ChannelID;

  // Find a SAME-pod pairing and a CROSS-pod pairing for bob by reconnecting until we've seen both
  const [aliceSocket, aliceCopy] = await connect(alice.token);
  let sameBobSocket, sameBobCopy, crossBobSocket, crossBobCopy;
  for (let attempt = 0; attempt < 20 && (!sameBobSocket || !crossBobSocket); attempt++) {
    const [socket, copy] = await connect(bob.token);
    if (copy === aliceCopy && !sameBobSocket) { sameBobSocket = socket; sameBobCopy = copy; }
    else if (copy !== aliceCopy && !crossBobSocket) { crossBobSocket = socket; crossBobCopy = copy; }
    else socket.close();
  }
  check('found a same-pod pairing', !!sameBobSocket, sameBobCopy || '');
  check('found a cross-pod pairing', !!crossBobSocket, crossBobCopy || '');
  if (!sameBobSocket || !crossBobSocket) {
    console.error('\nCould not find both pairings in 20 attempts. Needs >=2 backend pods and');
    console.error('REDIS_URL set (so cross-pod delivery is even possible to measure). Try again —');
    console.error('which pod a new connection lands on is load-balancer luck, not guaranteed.');
    process.exit(1);
  }

  await emit(aliceSocket, 'join:channel', channelId);
  await emit(sameBobSocket, 'join:channel', channelId);
  await emit(crossBobSocket, 'join:channel', channelId);

  console.log(`alice on ${aliceCopy}; same-pod bob on ${sameBobCopy}; cross-pod bob on ${crossBobCopy}`);
  console.log(`Warming up (${WARMUP} samples each, discarded)...`);
  await measure(aliceSocket, sameBobSocket, channelId, WARMUP);
  await measure(aliceSocket, crossBobSocket, channelId, WARMUP);

  console.log(`Measuring same-pod delivery, n=${SAMPLES}...`);
  const sameSamples = await measure(aliceSocket, sameBobSocket, channelId, SAMPLES);
  console.log(`Measuring cross-pod delivery, n=${SAMPLES}...`);
  const crossSamples = await measure(aliceSocket, crossBobSocket, channelId, SAMPLES);

  const sameStats = stats(sameSamples);
  const crossStats = stats(crossSamples);
  console.log('\nSame-pod (ms): ', sameStats);
  console.log('Cross-pod (ms):', crossStats);
  console.log(`\nRedis tax, p50: +${crossStats.p50 - sameStats.p50} ms`);
  console.log(`Redis tax, p95: +${crossStats.p95 - sameStats.p95} ms`);
  console.log(`Redis tax, p99: +${crossStats.p99 - sameStats.p99} ms`);

  check('cross-pod p50 is at or above same-pod p50 (the tax should not be negative)', crossStats.p50 >= sameStats.p50);

  aliceSocket.close();
  sameBobSocket.close();
  crossBobSocket.close();
});
