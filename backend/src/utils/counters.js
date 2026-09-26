// Short-lived counters (e.g. wrong two-factor codes). With REDIS_URL set they live in Redis, so
// every copy of the backend sees the same count and restarts don't reset it; otherwise they're
// kept in this process only.
const realtimeAdapter = require('../socket/adapter');

const local = new Map(); // key -> { count, expiresAt }

const liveLocal = (key) => {
  const entry = local.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry;
  local.delete(key);
  return null;
};

// Adds one and returns the new count. The window starts at the first increment.
exports.increment = async (key, ttlSeconds) => {
  const redis = realtimeAdapter.getRedis();
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, Math.max(1, Math.ceil(ttlSeconds)));
    return count;
  }

  const entry = liveLocal(key) || { count: 0, expiresAt: Date.now() + ttlSeconds * 1000 };
  entry.count += 1;
  local.set(key, entry);
  return entry.count;
};

exports.get = async (key) => {
  const redis = realtimeAdapter.getRedis();
  if (redis) return Number((await redis.get(key)) || 0);
  return liveLocal(key)?.count || 0;
};

exports.reset = async (key) => {
  const redis = realtimeAdapter.getRedis();
  if (redis) return redis.del(key);
  local.delete(key);
};
