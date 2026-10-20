// Fakes many simultaneous chat users (PLAN.md Phase 7). k6 has no Socket.IO client — "most
// underestimated task in this plan" per PLAN.md — so this speaks the Engine.IO/Socket.IO wire
// protocol directly over a raw WebSocket. Protocol cheatsheet, since the string-matching below is
// unreadable without it:
//
//   An Engine.IO packet is one type digit + optional payload: 0 open, 2 ping, 3 pong, 4 message
//   (wraps a Socket.IO packet). A Socket.IO packet is itself one type digit + optional ack id +
//   optional JSON array: 0 connect, 2 event, 3 ack, 4 connect_error. So the server's handshake
//   looks like "0{...}" (Engine.IO open), we reply "40{\"token\":...}" (Engine.IO message wrapping
//   a Socket.IO connect, carrying the `auth` payload backend/src/socket/socket.js reads), and a
//   normal event is "42[\"event\",payload]" or, with an ack id, "421[\"event\",payload]" — the
//   server answers with "431[...]". Socket.IO v4 flipped ping/pong direction from earlier
//   versions: the SERVER pings ("2"), the CLIENT must pong ("3") within pingTimeout or gets
//   dropped — miss this and every VU silently disconnects ~20s in.
//
// Each VU registers its own throwaway user over plain HTTP (same `/api/auth/register` the UI
// uses — never touches Supabase directly itself, it just inherits whatever database the target
// backend is already running with, same rule as backend/tests/*.test.js), joins the one shared
// space `setup()` creates, then holds a single WebSocket connection for its lifetime: one chat
// message every MESSAGE_INTERVAL_MS (~5s, per PLAN.md), acking keep-alive pings in between.
//
// Usage:
//   brew install k6
//   k6 run loadtest/socketio-load.js                           # local rehearsal: ramps to 20 VUs
//   k6 run -e PROFILE=full loadtest/socketio-load.js            # PLAN.md's real profile: 0->50->100->150
//   k6 run -e BASE=http://localhost:5001 loadtest/socketio-load.js   # against a non-k8s backend
//
// PLAN.md: "Rehearse at 20 VUs locally before spending cloud VUH" — PROFILE=full is sized for the
// off-host Grafana Cloud k6 runner against a real cluster with CPU requests/limits set, not this
// laptop's 2-pod local deployment. Default (PROFILE=local) is the safe one.
import http from 'k6/http';
import ws from 'k6/ws';
import { check } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const BASE = __ENV.BASE || 'http://localhost:8080';
const WS_BASE = BASE.replace(/^http/, 'ws');
const MESSAGE_INTERVAL_MS = Number(__ENV.MESSAGE_INTERVAL_MS || 5000);
// Unique per run, so repeated runs against the same database don't collide on username
const RUN = Date.now().toString(36);

const STAGE_PROFILES = {
  // A couple of VUs for a few seconds — for checking the protocol handshake still works after an
  // edit, without waiting out the full local rehearsal every time
  smoke: [
    { duration: '5s', target: 2 },
    { duration: '10s', target: 2 },
  ],
  local: [
    { duration: '20s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '10s', target: 0 },
  ],
  full: [
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 150 },
    { duration: '2m', target: 150 },
    { duration: '30s', target: 0 },
  ],
};
const PROFILE = __ENV.PROFILE || 'local';

// PLAN.md Phase 6's scaling-efficiency curve wants "fixed load, pods pinned at 1->2->4" — a
// constant VU count held steady, not a ramp, so throughput at each pod count is comparable
// apples-to-apples. scripts/scaling-efficiency.sh drives this one.
const FIXED_VUS = Number(__ENV.FIXED_VUS || 20);
const FIXED_DURATION = __ENV.FIXED_DURATION || '2m';

const scenario = PROFILE === 'fixed'
  ? { executor: 'constant-vus', vus: FIXED_VUS, duration: FIXED_DURATION, gracefulStop: '10s' }
  : { executor: 'ramping-vus', startVUs: 0, stages: STAGE_PROFILES[PROFILE], gracefulRampDown: '10s', gracefulStop: '10s' };

export const options = {
  scenarios: { chat_load: scenario },
  thresholds: {
    connect_success: ['rate>0.95'],
    join_channel_success: ['rate>0.95'],
    message_ack_latency: ['p(95)<2000'],
  },
};

const connectSuccess = new Rate('connect_success');
const joinChannelSuccess = new Rate('join_channel_success');
// Client-perceived round trip (send -> ack), the counterpart to the server-side
// chatscale_broadcast_latency_seconds histogram (backend/src/metrics.js, CHG-0030)
const messageAckLatency = new Trend('message_ack_latency', true);
const messagesSent = new Counter('chat_messages_sent');
const messagesAcked = new Counter('chat_messages_acked');

const authHeaders = (token) => ({ headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });

const registerUser = (name) => {
  const username = `lt${RUN}${name}`;
  const res = http.post(
    `${BASE}/api/auth/register`,
    JSON.stringify({ username, email: `${username}@loadtest.local`, password: 'longenough1' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (!check(res, { 'register: 201': (r) => r.status === 201 })) {
    throw new Error(`register failed for ${username}: ${res.status} ${res.body}`);
  }
  return { username, token: res.json('token') };
};

// Runs once before any VU starts: creates the one space/channel every VU piles into, and an
// invite code so throwaway VU users can join it (channel membership is required to send —
// backend/src/socket/messageHandlers.js's getAccessibleChannel checks it).
export function setup() {
  const owner = registerUser('owner');
  const spaceRes = http.post(`${BASE}/api/servers`, JSON.stringify({ serverName: 'k6 Load Test' }), authHeaders(owner.token));
  if (!check(spaceRes, { 'create space: 201': (r) => r.status === 201 })) {
    throw new Error(`setup: could not create space: ${spaceRes.status} ${spaceRes.body}`);
  }
  const spaceId = spaceRes.json('server.id');

  const channelsRes = http.get(`${BASE}/api/channels/servers/${spaceId}`, authHeaders(owner.token));
  const channelId = channelsRes.json('channels.0.ChannelID');

  const inviteRes = http.post(`${BASE}/api/servers/${spaceId}/invites`, null, authHeaders(owner.token));
  const inviteCode = inviteRes.json('invite.code');

  console.log(`setup: profile=${PROFILE} base=${BASE} space=${spaceId} channel=${channelId}`);
  return { channelId, inviteCode };
}

export default function (data) {
  const user = registerUser(`v${__VU}i${__ITER}`);
  const joinRes = http.post(`${BASE}/api/servers/join`, JSON.stringify({ inviteCode: data.inviteCode }), authHeaders(user.token));
  check(joinRes, { 'joined space: 200': (r) => r.status === 200 });

  const url = `${WS_BASE}/socket.io/?EIO=4&transport=websocket`;
  let nextAckId = 1;
  const pending = new Map(); // ackId -> { event, sentAt }

  const res = ws.connect(url, {}, (socket) => {
    socket.on('message', (msg) => {
      if (msg === '2') { socket.send('3'); return; } // Engine.IO ping -> pong (keeps the connection alive)

      if (msg.startsWith('0')) { // Engine.IO open: safe to request the Socket.IO connect now
        socket.send(`40${JSON.stringify({ token: user.token })}`);
        return;
      }

      if (msg.startsWith('40')) { // Socket.IO connected
        connectSuccess.add(1);
        const ackId = nextAckId++;
        pending.set(ackId, { event: 'join:channel', sentAt: Date.now() });
        socket.send(`42${ackId}${JSON.stringify(['join:channel', data.channelId])}`);
        return;
      }

      if (msg.startsWith('44')) { // Socket.IO connect_error — bad/expired token
        connectSuccess.add(0);
        socket.close();
        return;
      }

      if (msg.startsWith('43')) { // ack reply: "43<id>[payload]"
        const m = msg.slice(2).match(/^(\d+)(\[[\s\S]*\])$/);
        if (!m) return;
        const ackId = Number(m[1]);
        const [payload] = JSON.parse(m[2]);
        const inFlight = pending.get(ackId);
        if (!inFlight) return;
        pending.delete(ackId);

        if (inFlight.event === 'join:channel') {
          const joined = !!(payload && payload.ok);
          joinChannelSuccess.add(joined ? 1 : 0);
          if (!joined) { socket.close(); return; }
          // Membership confirmed — start the chat loop for the rest of this VU's connection
          socket.setInterval(() => {
            const id = nextAckId++;
            const sentAt = Date.now();
            pending.set(id, { event: 'message:send', sentAt });
            socket.send(`42${id}${JSON.stringify(['message:send', {
              channelId: data.channelId,
              content: `load test ${user.username} #${id}`,
              sentAt,
            }])}`);
            messagesSent.add(1);
          }, MESSAGE_INTERVAL_MS);
        } else if (inFlight.event === 'message:send') {
          messageAckLatency.add(Date.now() - inFlight.sentAt);
          if (payload && payload.ok) messagesAcked.add(1);
        }
      }
    });

    socket.on('error', (e) => console.error(`VU ${__VU} ws error: ${e.error}`));
  });

  check(res, { 'ws upgrade: 101': (r) => r && r.status === 101 });
}
