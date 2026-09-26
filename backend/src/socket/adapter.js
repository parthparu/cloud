// How copies of the backend share real-time events.
//
//   REDIS_URL unset -> Socket.IO's default in-memory adapter: each copy only reaches the users
//                      connected to it. Fine for one copy; with several, messages don't cross
//                      (the failure in docs/evidence/01-two-copies-break.md).
//   REDIS_URL set   -> @socket.io/redis-adapter: every broadcast is published to Redis (or Valkey)
//                      and each copy delivers it to its own users. This is the fix (PLAN.md Phase 3b).
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const INSTANCE_NAME = require('../config/instance');

const COPIES_KEY = 'chatscale:copies';
exports.COPIES_KEY = COPIES_KEY;

// A plain command client, shared with other features that need state across copies
let commandClient = null;

const describe = (url) => {
  const { hostname, port } = new URL(url);
  return `${hostname}:${port || 6379}`;
};

exports.setup = async (io) => {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.log('[realtime] adapter: in-memory — this copy only reaches its own users');
    return;
  }

  // The adapter needs two connections: one to publish, one in subscriber mode
  const pubClient = createClient({ url });
  const subClient = pubClient.duplicate();
  for (const client of [pubClient, subClient]) {
    client.on('error', (err) => console.error('[realtime] Redis error:', err.message));
  }

  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
  } catch (err) {
    throw new Error(`could not reach Redis at ${describe(url)} (${err.message})`);
  }

  io.adapter(createAdapter(pubClient, subClient));
  commandClient = pubClient;

  // Register "adapter id -> copy name" so tools like scripts/watch-redis.js can say which copy
  // published a message (the adapter itself only carries a random id)
  await pubClient.hSet(COPIES_KEY, io.of('/').adapter.uid, INSTANCE_NAME);
  await pubClient.expire(COPIES_KEY, 7 * 24 * 60 * 60);
  console.log(`[realtime] adapter: Redis at ${describe(url)} — broadcasts reach every copy`);
};

exports.isShared = () => commandClient !== null;

// null when running without Redis
exports.getRedis = () => commandClient;
