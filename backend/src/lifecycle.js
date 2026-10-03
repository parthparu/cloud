// Health checks and graceful shutdown — what an orchestrator (Docker, Kubernetes) needs from us.
//
//   GET /healthz  liveness:  "is this process alive?"  Fails only if the process is wedged.
//                 Kubernetes restarts the container when this fails.
//   GET /readyz   readiness: "should this copy receive traffic?"  Checks the database (and Redis,
//                 when configured). Load balancers stop routing here while it fails, including
//                 during shutdown.
//
// On SIGTERM (Docker stop, Kubernetes scale-down, rolling update) or SIGINT (Ctrl-C):
//   1. report not ready, so the load balancer stops sending new users here
//   2. wait SHUTDOWN_DRAIN_SECONDS for that to take effect
//   3. close live connections — browsers reconnect, and land on another copy
//   4. stop the HTTP server, close the database and Redis, exit
// A hard deadline guarantees the process exits even if something hangs.
const db = require('./config/db');
const realtimeAdapter = require('./socket/adapter');
const INSTANCE_NAME = require('./config/instance');

const CHECK_TIMEOUT_MS = 2000;
let shuttingDown = false;

const withTimeout = (promise, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), CHECK_TIMEOUT_MS)),
  ]);

const check = async (label, fn) => {
  try {
    await withTimeout(fn(), label);
    return 'ok';
  } catch (error) {
    return `failing: ${error.message}`;
  }
};

exports.liveness = (req, res) => {
  res.status(200).json({ status: 'alive', instance: INSTANCE_NAME });
};

exports.readiness = async (req, res) => {
  const checks = {
    database: await check('database', () => db.execute('SELECT 1')),
  };
  const redis = realtimeAdapter.getRedis();
  if (redis) checks.redis = await check('redis', () => redis.ping());

  const ready = !shuttingDown && Object.values(checks).every((result) => result === 'ok');
  res.status(ready ? 200 : 503).json({
    status: shuttingDown ? 'shutting down' : ready ? 'ready' : 'not ready',
    instance: INSTANCE_NAME,
    checks,
  });
};

exports.installShutdown = ({ server, io }) => {
  const drainSeconds = Number(process.env.SHUTDOWN_DRAIN_SECONDS || 0);
  const deadlineSeconds = Number(process.env.SHUTDOWN_TIMEOUT_SECONDS || drainSeconds + 10);

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    const started = Date.now();
    console.log(`[${INSTANCE_NAME}] ${signal} received — draining for ${drainSeconds}s, then closing`);

    setTimeout(() => {
      console.error(`[${INSTANCE_NAME}] shutdown took longer than ${deadlineSeconds}s — forcing exit`);
      process.exit(1);
    }, deadlineSeconds * 1000).unref();

    await new Promise((resolve) => setTimeout(resolve, drainSeconds * 1000));

    // io.close() closes only THIS copy's connections (unlike io.disconnectSockets(), which the Redis
    // adapter broadcasts to every copy and would disconnect all users everywhere), stops the
    // real-time engine and the HTTP server. Browsers see a dropped connection and reconnect by
    // themselves after a randomised delay; the load balancer sends them to a copy that is up.
    const connected = io.of('/').sockets.size;
    const closed = io.close();
    console.log(`[${INSTANCE_NAME}] closed ${connected} live connection(s); they will reconnect elsewhere`);

    // Idle keep-alive connections (e.g. from the load balancer) would otherwise keep the HTTP server
    // open indefinitely; anything still busy gets 2 s to finish.
    server.closeIdleConnections();
    const forceClose = setTimeout(() => server.closeAllConnections(), 2000);
    await closed;
    clearTimeout(forceClose);
    console.log(`[${INSTANCE_NAME}] http server closed`);
    await Promise.allSettled([db.close?.(), realtimeAdapter.getRedis()?.quit()]);
    console.log(`[${INSTANCE_NAME}] database and redis connections closed`);

    console.log(`[${INSTANCE_NAME}] stopped cleanly in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
