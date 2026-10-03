// Accounts, friends, spaces, invite links, channels and real-time messaging.
const { check, call, register, connect, emit, once, run, uname } = require('./lib');

run(async () => {
  let r = await call('POST', '/api/auth/register', null, { username: 'x', email: 'bad', password: '1' });
  check('register rejects bad input', r.status === 400, r.body.message);

  const alice = await register('alice');
  const bob = await register('bob');
  check('register two users', !!alice.token && !!bob.token);

  r = await call('POST', '/api/auth/register', null, { username: alice.username.toUpperCase(), email: `other_${alice.email}`, password: 'longenough1' });
  check('duplicate username is case-insensitive', r.status === 400, r.body.message);

  r = await call('POST', '/api/auth/login', null, { email: alice.email.toUpperCase(), password: alice.password });
  check('login with case-insensitive email', r.status === 200);
  r = await call('GET', '/api/auth/me', alice.token);
  check('/auth/me', r.status === 200 && r.body.user.username === alice.username);

  // Friends
  r = await call('POST', '/api/friends/requests', alice.token, { username: bob.username.toUpperCase() });
  check('send friend request', r.status === 201, r.body.message);
  const firstRequest = r.body.friendship.id;
  check('bob sees it as incoming', (await call('GET', '/api/friends', bob.token)).body.friends[0]?.direction === 'incoming');
  check('alice sees it as outgoing', (await call('GET', '/api/friends', alice.token)).body.friends[0]?.direction === 'outgoing');
  r = await call('PUT', `/api/friends/requests/${firstRequest}`, bob.token, { accept: false });
  check('decline', r.status === 200);
  check('declining removes the request (does not block)', (await call('GET', '/api/friends', alice.token)).body.friends.length === 0);
  const second = (await call('POST', '/api/friends/requests', alice.token, { username: bob.username })).body.friendship.id;
  r = await call('PUT', `/api/friends/requests/${second}`, bob.token, { accept: true });
  check('accept', r.status === 200 && r.body.friendship.status === 'Accepted');

  // Spaces and invite links
  r = await call('POST', '/api/servers', alice.token, { serverName: 'Test Space' });
  check('create space', r.status === 201);
  const spaceId = r.body.server.id;
  r = await call('GET', `/api/channels/servers/${spaceId}`, alice.token);
  check('new space has one text channel', r.body.channels.length === 1 && r.body.channels[0].ChannelType === 'Text');
  const channelId = r.body.channels[0].ChannelID;
  r = await call('POST', `/api/servers/${spaceId}/invites`, alice.token);
  check('invite link created', r.status === 201 && r.body.invite.code.length >= 8);
  const code = r.body.invite.code;
  r = await call('GET', `/api/servers/invites/${code}`, bob.token);
  check('invite preview', r.status === 200 && r.body.invite.server.name === 'Test Space');

  // Sockets: membership gate, then live messages
  const [aliceSocket, aliceCopy] = await connect(alice.token);
  const [bobSocket] = await connect(bob.token);
  check('session:ready names the serving copy', !!aliceCopy, aliceCopy);
  let ack = await emit(bobSocket, 'join:channel', channelId);
  check('non-member cannot join a channel', ack.ok === false);
  r = await call('POST', '/api/servers/join', bob.token, { inviteCode: code });
  check('join with invite', r.status === 200 && !r.body.alreadyMember);
  r = await call('POST', '/api/servers/join', bob.token, { inviteCode: code });
  check('joining twice is harmless', r.status === 200 && r.body.alreadyMember);
  check('alice joins channel', (await emit(aliceSocket, 'join:channel', channelId)).ok);
  check('bob joins channel', (await emit(bobSocket, 'join:channel', channelId)).ok);

  const arrival = once(bobSocket, 'message:new');
  const sentAt = Date.now();
  ack = await emit(aliceSocket, 'message:send', { channelId, content: '  hello bob  ', sentAt });
  check('send is acknowledged and trimmed', ack.ok && ack.message.content === 'hello bob');
  const received = await arrival;
  check('bob receives it live, with sentAt', received?.content === 'hello bob' && received?.sentAt === sentAt);
  ack = await emit(aliceSocket, 'message:send', { channelId, content: '   ' });
  check('empty message rejected', !ack.ok);
  ack = await emit(bobSocket, 'message:delete', { messageId: received.id });
  check("bob cannot delete alice's message", !ack.ok);
  ack = await emit(aliceSocket, 'message:edit', { messageId: received.id, content: 'edited' });
  check('edit own message', ack.ok);
  r = await call('GET', `/api/messages/channels/${channelId}/messages`, bob.token);
  check('history shows the edit', r.body.messages.at(-1)?.MessageContent === 'edited');
  ack = await emit(aliceSocket, 'message:delete', { messageId: received.id });
  check('delete own message', ack.ok);

  // New channels are announced to the space
  bobSocket.emit('join:server', spaceId);
  await new Promise((resolve) => setTimeout(resolve, 300));
  const announced = once(bobSocket, 'channel:created', 1500);
  r = await call('POST', `/api/channels/servers/${spaceId}`, alice.token, { channelName: 'Random Stuff!' });
  check('channel names become slugs', r.body.channel?.name === 'random-stuff', r.body.channel?.name);
  check('channel:created reaches members', (await announced)?.name === 'random-stuff');

  aliceSocket.close();
  bobSocket.close();
});
