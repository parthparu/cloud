#!/usr/bin/env node
// Live view of what the backend copies send each other through Redis — for demos and debugging.
//
//   cd backend && npm run watch-redis                  (Redis at redis://localhost:6379)
//   REDIS_URL=redis://host:port npm run watch-redis
//   npm run watch-redis -- --all                       (also typing indicators and internal requests)
//
// Socket.IO's Redis adapter publishes each broadcast as [senderId, packet, options] in MessagePack.
// This decodes it, names the sending copy, and prints it in plain words. It also shows the shared
// two-factor wrong-code counters as they change.
const { createClient } = require('redis');
const msgpack = require('notepack.io');

const url = process.env.REDIS_URL || 'redis://localhost:6379';
const showAll = process.argv.includes('--all');
const COPIES_KEY = 'chatscale:copies';

const c = { dim: '\x1b[2m', bold: '\x1b[1m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', magenta: '\x1b[35m', reset: '\x1b[0m' };
const time = () => new Date().toLocaleTimeString([], { hour12: false });
const say = (line, detail) => {
  console.log(`${c.dim}${time()}${c.reset}  ${line}`);
  if (detail) console.log(`          ${detail}`);
};

let copies = {};
const copyName = async (redis, uid) => {
  if (!copies[uid]) copies = await redis.hGetAll(COPIES_KEY);
  return copies[uid] || `copy ${String(uid).slice(0, 6)}`;
};

// What each event means to a person watching
const describe = (event, data) => {
  switch (event) {
    case 'message:new':
      return `${c.bold}${data.username}${c.reset}: "${String(data.content).slice(0, 80)}"`;
    case 'message:update':
      return `message ${data.id} edited`;
    case 'message:delete':
      return `message ${data.id} deleted`;
    case 'friend:request':
      return `friend request from ${data.user?.username}`;
    case 'friend:response':
      return `${data.user?.username} ${data.accepted ? 'accepted' : 'declined'} a friend request`;
    case 'invitation:new':
      return `${data.invitedBy} invited them to "${data.space?.name}"`;
    case 'channel:created':
      return `new channel #${data.name}`;
    case 'user:status':
      return `user ${data.userId} is now ${data.status}`;
    default:
      return '';
  }
};

const audience = (room) => {
  if (!room) return 'everyone';
  if (room.startsWith('user:')) return `user ${room.slice(5)} (personal notification)`;
  return room;
};

(async () => {
  const redis = createClient({ url });
  const subscriber = redis.duplicate();
  for (const client of [redis, subscriber]) client.on('error', (err) => console.error('Redis error:', err.message));
  await Promise.all([redis.connect(), subscriber.connect()]);

  copies = await redis.hGetAll(COPIES_KEY);
  console.log(`${c.bold}Watching Redis at ${url}${c.reset}  ${c.dim}(Ctrl-C to stop)${c.reset}`);
  console.log(`${c.dim}Copies registered: ${Object.values(copies).join(', ') || 'none yet — start the backend with REDIS_URL'}${c.reset}\n`);

  // Broadcasts: channel "socket.io#/#" or "socket.io#/#<room>#"
  await subscriber.pSubscribe('socket.io#*', async (message, channel) => {
    try {
      const [uid, packet, opts] = msgpack.decode(message);
      const [event, data = {}] = packet.data || [];
      if (!showAll && event.startsWith('typing:')) return;

      const room = channel.toString().split('#')[2] || (opts.rooms || [])[0];
      const from = await copyName(redis, uid);
      const color = event === 'message:new' ? c.green : c.cyan;
      say(`${c.yellow}${from}${c.reset} → Redis → every copy   ${color}${event}${c.reset} for ${audience(room)}`, describe(event, data));
    } catch (err) {
      say(`${c.dim}(could not decode a message: ${err.message})${c.reset}`);
    }
  }, true);

  // Copies asking each other questions, e.g. "who is in channel:1?" for the delivery log
  if (showAll) {
    await subscriber.pSubscribe('socket.io-request#*', async (message) => {
      let request;
      try {
        request = JSON.parse(message.toString());
      } catch {
        request = msgpack.decode(message);
      }
      say(`${c.dim}${await copyName(redis, request.uid)} asks every copy a question (request type ${request.type}) — e.g. "who is in this room?"${c.reset}`);
    }, true);
  }

  // Shared counters (two-factor wrong codes), polled once a second
  const seen = {};
  setInterval(async () => {
    try {
      for await (const key of redis.scanIterator({ MATCH: '2fa:*', COUNT: 100 })) {
        const value = await redis.get(key);
        if (value !== null && seen[key] !== value) {
          seen[key] = value;
          const who = key.startsWith('2fa:user:') ? `user ${key.split(':')[2]}` : 'one sign-in attempt';
          say(`${c.magenta}shared counter${c.reset} ${key} = ${value}`, `wrong 2FA codes so far for ${who} — every copy sees this same number`);
        }
      }
    } catch {}
  }, 1000);
})().catch((err) => {
  console.error(`Could not connect to Redis at ${url}: ${err.message}`);
  console.error('Is the demo running with --fixed (or Redis started)?');
  process.exit(1);
});
