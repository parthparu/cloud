const voiceChannelService = require('../services/voiceChannelService');
const serverService = require('../services/serverService');

module.exports = (io, socket) => {

  socket.on('voice:join', async (data) => {
    try {
      const { channelId } = data;
      const userId = socket.user.id;


      const channels = await voiceChannelService.getVoiceChannelById(channelId);
      if (channels.length === 0) {
        return socket.emit('error', { message: 'Voice channel not found' });
      }

      const channel = channels[0];

      const isMember = await serverService.isServerMember(channel.ServerID, userId);
      if (!isMember) {
        return socket.emit('error', { message: 'You are not a member of this server' });
      }

      await voiceChannelService.addUserToVoiceChannel({
        voiceChannelID: channelId,
        userID: userId,
        joinTime: new Date(),
        isMuted: false,
        isDeafened: false
      });

      socket.join(`voice:${channelId}`);

      // Get all users in the voice channel
      const participants = await voiceChannelService.getVoiceChannelParticipants(channelId);

      // Broadcast to channel that user joined
      io.to(`voice:${channelId}`).emit('voice:user-joined', {
        userId: socket.user.id,
        username: socket.user.username,
        channelId
      });

      // Send list of participants to the user
      socket.emit('voice:participants', { participants });
    } catch (error) {
      console.error('Error joining voice channel:', error);
      socket.emit('error', { message: 'Failed to join voice channel' });
    }
  });

  // Leave voice channel
  socket.on('voice:leave', async (data) => {
    try {
      const { channelId } = data;
      const userId = socket.user.id;

      // Update participant record with leave time
      await voiceChannelService.updateVoiceChannelParticipant(channelId, userId, {
        LeaveTime: new Date()
      });

      // Leave socket room
      socket.leave(`voice:${channelId}`);

      // Broadcast to channel that user left
      io.to(`voice:${channelId}`).emit('voice:user-left', {
        userId: socket.user.id,
        username: socket.user.username,
        channelId
      });
    } catch (error) {
      console.error('Error leaving voice channel:', error);
      socket.emit('error', { message: 'Failed to leave voice channel' });
    }
  });

  // Toggle mute
  socket.on('voice:toggle-mute', async (data) => {
    try {
      const { channelId, isMuted } = data;
      const userId = socket.user.id;

      // Update participant record
      await voiceChannelService.updateVoiceChannelParticipant(channelId, userId, {
        IsMuted: isMuted
      });

      // Broadcast to channel
      io.to(`voice:${channelId}`).emit('voice:user-mute', {
        userId: socket.user.id,
        isMuted,
        channelId
      });
    } catch (error) {
      console.error('Error toggling mute:', error);
      socket.emit('error', { message: 'Failed to toggle mute' });
    }
  });

  // Toggle deafen
  socket.on('voice:toggle-deafen', async (data) => {
    try {
      const { channelId, isDeafened } = data;
      const userId = socket.user.id;

      // Update participant record
      await voiceChannelService.updateVoiceChannelParticipant(channelId, userId, {
        IsDeafened: isDeafened
      });

      // Broadcast to channel
      io.to(`voice:${channelId}`).emit('voice:user-deafen', {
        userId: socket.user.id,
        isDeafened,
        channelId
      });
    } catch (error) {
      console.error('Error toggling deafen:', error);
      socket.emit('error', { message: 'Failed to toggle deafen' });
    }
  });

  // Voice signaling for WebRTC
  socket.on('voice:signal', (data) => {
    const { userId, signal } = data;

    // Forward the signal to the specific user
    io.to(`user:${userId}`).emit('voice:signal', {
      userId: socket.user.id,
      signal
    });
  });
};
