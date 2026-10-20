// Prometheus metrics, scraped from GET /metrics (PLAN.md Phase 4).
//
// Four custom series plus prom-client's default Node process metrics (CPU, memory, event loop lag,
// GC). `instance` labels every custom series with INSTANCE_NAME so Grafana can break results down
// by pod without relying on Prometheus's own target-discovery labels.
//
//   chatscale_socket_connections        gauge      live Socket.IO connections on this copy
//   chatscale_messages_total            counter    messages successfully sent, this copy
//   chatscale_broadcast_latency_seconds histogram  time this copy spent fanning a message out
//                                                   (room emit, plus a cross-copy fetchSockets()
//                                                   check when the Redis adapter is active)
//   chatscale_delivery_latency_seconds  histogram  client-send-to-client-receive latency, labelled
//                                                   same_pod / cross_pod — not yet fed: it needs the
//                                                   receiving client to report back, wired up as
//                                                   part of Phase 6's load test (PLAN.md Phase 6)
const client = require('prom-client');
const INSTANCE_NAME = require('./config/instance');

const register = new client.Registry();
register.setDefaultLabels({ instance: INSTANCE_NAME });
client.collectDefaultMetrics({ register });

exports.connections = new client.Gauge({
  name: 'chatscale_socket_connections',
  help: 'Live Socket.IO connections on this copy',
  registers: [register],
});

exports.messagesTotal = new client.Counter({
  name: 'chatscale_messages_total',
  help: 'Messages successfully sent, this copy',
  registers: [register],
});

exports.broadcastLatency = new client.Histogram({
  name: 'chatscale_broadcast_latency_seconds',
  help: "Time this copy spent fanning a message's broadcast out to its room",
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});

exports.deliveryLatency = new client.Histogram({
  name: 'chatscale_delivery_latency_seconds',
  help: 'Client-send to client-receive latency, labelled by whether sender and receiver share a pod',
  labelNames: ['locality'],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

exports.handler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};
