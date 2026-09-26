const messageService = require('../services/messageService');
const channelService = require('../services/channelService');
const serverService = require('../services/serverService');
const userService = require('../services/userService');

const MAX_MESSAGE_LENGTH = 4000;

// Reply through the client's acknowledgement callback when it supplied one,
// otherwise fall back to an 'error' event so older clients still hear about failures.
const reply = (socket, ack, payload) => {
  if (typeof ack === 'function') {
    ack(payload);
  } else if (!payload.ok) {
    socket.emit('error', { message: payload.error });
  }
};

// Resolve a channel and confirm the socket's user may use it
const getAccessibleChannel = async (channelId, userId) => {
  const channels = await channelService.getChannelById(channelId);
  if (channels.length === 0) {
    return { error: 'Channel not found' };
  }

  const channel = channels[0];
  const isMember = await serverService.isServerMember(channel.ServerID, userId);
  if (!isMember) {
    return { error: 'You are not a member of this server' };
  }

  return { channel };
};

module.exports = (io, socket) => {
  // Join a channel room — only members of the channel's server may listen in
  socket.on('join:channel', async (channelId, ack) => {
    try {
      const { error } = await getAccessibleChannel(channelId, socket.user.id);
      if (error) {
        return reply(socket, ack, { ok: false, error });
      }

      socket.join(`channel:${channelId}`);
      reply(socket, ack, { ok: true });
    } catch (error) {
      console.error('Error joining channel:', error);
      reply(socket, ack, { ok: false, error: 'Failed to join channel' });
    }
  });

  socket.on('leave:channel', (channelId) => {
    socket.leave(`channel:${channelId}`);
  });

  // Send a message
  socket.on('message:send', async (data = {}, ack) => {
    try {
      const { channelId, sentAt } = data;
      const content = String(data.content || '').trim();
      const userId = socket.user.id;

      if (!content) {
        return reply(socket, ack, { ok: false, error: 'Message content cannot be empty' });
      }
      if (content.length > MAX_MESSAGE_LENGTH) {
        return reply(socket, ack, { ok: false, error: `Messages are limited to ${MAX_MESSAGE_LENGTH} characters` });
      }

      const { error } = await getAccessibleChannel(channelId, userId);
      if (error) {
        return reply(socket, ack, { ok: false, error });
      }

      const message = await messageService.createMessage({
        channelID: channelId,
        userID: userId,
        messageContent: content,
        messageDate: new Date()
      });

      const users = await userService.getUserById(userId);
      const user = users[0];

      const messageData = {
        id: message.MessageID,
        channelId: Number(channelId),
        userId,
        username: user.Username,
        profilePicture: user.ProfilePicture,
        content,
        createdAt: message.MessageDate,
        // Client send time, passed through untouched for end-to-end delivery latency (PLAN.md Phase 6)
        sentAt: Number.isFinite(sentAt) ? sentAt : null
      };

      io.to(`channel:${channelId}`).emit('message:new', messageData);
      reply(socket, ack, { ok: true, message: messageData });
    } catch (error) {
      console.error('Error sending message:', error);
      reply(socket, ack, { ok: false, error: 'Failed to send message' });
    }
  });

  // Edit a message
  socket.on('message:edit', async (data = {}, ack) => {
    try {
      const { messageId } = data;
      const content = String(data.content || '').trim();
      const userId = socket.user.id;

      if (!content) {
        return reply(socket, ack, { ok: false, error: 'Message content cannot be empty' });
      }

      const message = await messageService.getMessageById(messageId);
      if (!message) {
        return reply(socket, ack, { ok: false, error: 'Message not found' });
      }

      if (message.UserID !== userId) {
        return reply(socket, ack, { ok: false, error: 'You can only edit your own messages' });
      }

      const updated = await messageService.updateMessage(messageId, {
        MessageContent: content
      });

      if (!updated) {
        return reply(socket, ack, { ok: false, error: 'Failed to update message' });
      }

      io.to(`channel:${message.ChannelID}`).emit('message:update', {
        id: message.MessageID,
        channelId: message.ChannelID,
        content
      });
      reply(socket, ack, { ok: true });
    } catch (error) {
      console.error('Error editing message:', error);
      reply(socket, ack, { ok: false, error: 'Failed to edit message' });
    }
  });

  // Delete a message
  socket.on('message:delete', async (data = {}, ack) => {
    try {
      const { messageId } = data;
      const userId = socket.user.id;

      const message = await messageService.getMessageById(messageId);
      if (!message) {
        return reply(socket, ack, { ok: false, error: 'Message not found' });
      }

      // Authors can delete their own messages; the server owner can delete any
      if (message.UserID !== userId) {
        const channels = await channelService.getChannelById(message.ChannelID);
        const servers = await serverService.getServerById(channels[0].ServerID);

        if (servers[0].ServerOwnerID !== userId) {
          return reply(socket, ack, { ok: false, error: 'You can only delete your own messages' });
        }
      }

      const deleted = await messageService.deleteMessage(messageId);
      if (!deleted) {
        return reply(socket, ack, { ok: false, error: 'Failed to delete message' });
      }

      io.to(`channel:${message.ChannelID}`).emit('message:delete', {
        id: message.MessageID,
        channelId: message.ChannelID
      });
      reply(socket, ack, { ok: true });
    } catch (error) {
      console.error('Error deleting message:', error);
      reply(socket, ack, { ok: false, error: 'Failed to delete message' });
    }
  });

  // Typing indicator — only relayed to rooms this socket has already been admitted to
  socket.on('typing:start', ({ channelId } = {}) => {
    if (!socket.rooms.has(`channel:${channelId}`)) return;

    socket.to(`channel:${channelId}`).emit('typing:start', {
      userId: socket.user.id,
      username: socket.user.username,
      channelId
    });
  });

  socket.on('typing:stop', ({ channelId } = {}) => {
    if (!socket.rooms.has(`channel:${channelId}`)) return;

    socket.to(`channel:${channelId}`).emit('typing:stop', {
      userId: socket.user.id,
      channelId
    });
  });
};
