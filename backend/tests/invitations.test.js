// Inviting people to a space by username.
const { check, call, register, connect, once, run } = require('./lib');

run(async () => {
  const [alice, bob, carl, dora] = await Promise.all(['alice', 'bob', 'carl', 'dora'].map((n) => register(`inv_${n}`)));
  const spaceId = (await call('POST', '/api/servers', alice.token, { serverName: 'Demo Day' })).body.server.id;

  const [bobSocket] = await connect(bob.token);
  const live = once(bobSocket, 'invitation:new', 2000);
  let r = await call('POST', '/api/invitations', alice.token, { serverId: spaceId, username: bob.username.toUpperCase() });
  check('invite by username (case-insensitive)', r.status === 201, r.body.message);
  const event = await live;
  check('invitee is notified live', event?.space?.name === 'Demo Day' && event.invitedBy === alice.username);

  r = await call('POST', '/api/invitations', alice.token, { serverId: spaceId, username: bob.username });
  check('duplicate invitation rejected', r.status === 400);
  r = await call('POST', '/api/invitations', alice.token, { serverId: spaceId, username: 'nobody_at_all' });
  check('unknown user -> generic 404', r.status === 404);
  r = await call('POST', '/api/invitations', alice.token, { serverId: spaceId, username: alice.username });
  check('cannot invite yourself', r.status === 400);
  r = await call('POST', '/api/invitations', carl.token, { serverId: spaceId, username: dora.username });
  check('non-members cannot invite', r.status === 403);

  await call('POST', '/api/friends/block', dora.token, { username: alice.username });
  r = await call('POST', '/api/invitations', alice.token, { serverId: spaceId, username: dora.username });
  check('blocked -> same generic 404 (block not revealed)', r.status === 404 && /Check the username/.test(r.body.message));

  r = await call('GET', '/api/invitations', bob.token);
  check('bob has one pending invitation', r.body.invitations.length === 1);
  const invitationId = r.body.invitations[0].id;
  r = await call('POST', `/api/invitations/${invitationId}/accept`, carl.token);
  check('only the invitee can accept', r.status === 404);
  r = await call('GET', `/api/channels/servers/${spaceId}`, bob.token);
  check('not a member before accepting', r.status === 403);
  r = await call('POST', `/api/invitations/${invitationId}/accept`, bob.token);
  check('accept', r.status === 200 && r.body.space.id === spaceId);
  r = await call('GET', `/api/channels/servers/${spaceId}`, bob.token);
  check('member after accepting', r.status === 200);
  check('invitation gone after accepting', (await call('GET', '/api/invitations', bob.token)).body.invitations.length === 0);
  r = await call('POST', '/api/invitations', alice.token, { serverId: spaceId, username: bob.username });
  check('cannot invite an existing member', r.status === 400);

  await call('POST', '/api/invitations', alice.token, { serverId: spaceId, username: carl.username });
  const carlInvitation = (await call('GET', '/api/invitations', carl.token)).body.invitations[0].id;
  check('decline', (await call('DELETE', `/api/invitations/${carlInvitation}`, carl.token)).status === 200);
  check('declined -> not a member', (await call('GET', `/api/channels/servers/${spaceId}`, carl.token)).status === 403);
  check('can re-invite after a decline', (await call('POST', '/api/invitations', alice.token, { serverId: spaceId, username: carl.username })).status === 201);

  bobSocket.close();
});
