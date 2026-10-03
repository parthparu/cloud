// The experiment itself: do live events reach users connected to a *different* backend copy?
//
//   EXPECT=shared   (default) copies share events through Redis — everything should arrive
//   EXPECT=isolated copies don't share — nothing should cross (the original failure)
//
// Point BASE at a load balancer in front of several copies (docker compose: :8080), or set
// BASE_A and BASE_B to two copies directly. Users are connected until they sit on different copies.
const { check, call, register, connect, emit, once, run, BASE } = require('./lib');

const BASE_A = process.env.BASE_A || BASE;
const BASE_B = process.env.BASE_B || BASE;
const shared = (process.env.EXPECT || 'shared') === 'shared';

run(async () => {
  const alice = await register('xa', BASE_A);
  const bob = await register('xb', BASE_B);
  const spaceId = (await call('POST', '/api/servers', alice.token, { serverName: 'Cross copy' }, BASE_A)).body.server.id;
  const code = (await call('POST', `/api/servers/${spaceId}/invites`, alice.token, null, BASE_A)).body.invite.code;
  await call('POST', '/api/servers/join', bob.token, { inviteCode: code }, BASE_B);
  const channelId = (await call('GET', `/api/channels/servers/${spaceId}`, alice.token, null, BASE_A)).body.channels[0].ChannelID;

  const [aliceSocket, aliceCopy] = await connect(alice.token, BASE_A);
  let bobSocket, bobCopy;
  for (let attempt = 0; attempt < 10; attempt++) {
    [bobSocket, bobCopy] = await connect(bob.token, BASE_B);
    if (bobCopy !== aliceCopy) break;
    bobSocket.close();
  }
  check('alice and bob are on different copies', bobCopy !== aliceCopy, `alice on ${aliceCopy}, bob on ${bobCopy}`);

  await emit(aliceSocket, 'join:channel', channelId);
  await emit(bobSocket, 'join:channel', channelId);

  const arrival = once(bobSocket, 'message:new');
  const sentAt = Date.now();
  await emit(aliceSocket, 'message:send', { channelId, content: 'hello from the other copy', sentAt });
  const message = await arrival;
  check(
    shared ? "bob receives alice's message live" : "bob does NOT receive alice's message (isolated copies)",
    shared ? !!message : !message,
    message ? `latency ${Date.now() - sentAt} ms` : ''
  );

  const request = once(bobSocket, 'friend:request');
  await call('POST', '/api/friends/requests', alice.token, { username: bob.username }, BASE_A);
  const notified = await request;
  check(
    shared ? 'friend request notification crosses copies' : 'friend request notification does NOT cross copies',
    shared ? !!notified : !notified
  );

  aliceSocket.close();
  bobSocket.close();
});
