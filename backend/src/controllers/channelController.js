const channelService = require('../services/channelService');
const serverService = require('../services/serverService');
const { getIo } = require('../socket/socket');

// Create a new channel
exports.createChannel = async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const { channelDescription, isPrivate } = req.body;
    const channelType = req.body.channelType || 'Text';
    // Channel names are lowercase, dash-separated slugs
    const channelName = String(req.body.channelName || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 32);
    const userId = req.user.id;
    
    if (!channelName) {
      return res.status(400).json({ message: 'Channel name is required' });
    }
    
    // Check if server exists
    const servers = await serverService.getServerById(serverId);
    if (servers.length === 0) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    // Check if user has permission to create channels
    const isMember = await serverService.isServerMember(serverId, userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this server' });
    }
    
    // Create channel
    const channelId = await channelService.createChannel({
      serverID: serverId,
      channelName,
      channelType,
      channelDescription,
      isPrivate: isPrivate !== undefined ? isPrivate : false,
      channelOwnerID: userId,
      createDate: new Date()
    });
    
    const channel = {
      id: channelId,
      name: channelName,
      type: channelType,
      description: channelDescription,
      isPrivate: isPrivate !== undefined ? isPrivate : false,
      serverId: Number(serverId)
    };
    
    // Let everyone currently in the space see the new channel
    getIo().to(`server:${serverId}`).emit('channel:created', channel);
    
    res.status(201).json({
      message: 'Channel created successfully',
      channel
    });
  } catch (error) {
    next(error);
  }
};

// Get all channels in a server
exports.getServerChannels = async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const userId = req.user.id;
    
    // Check if server exists
    const servers = await serverService.getServerById(serverId);
    if (servers.length === 0) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    // Check if user is a member of the server
    const isMember = await serverService.isServerMember(serverId, userId);
    if (!isMember && !servers[0].IsPublic) {
      return res.status(403).json({ message: 'You are not a member of this server' });
    }
    
    // Get channels
    const channels = await channelService.getServerChannels(serverId);
    
    // Filter out private channels if user doesn't have access
    const filteredChannels = channels.filter(channel => {
      if (!channel.IsPrivate) return true;
      
      // TODO: Check if user has access to private channel
      // For now, only show private channels to server owner
      return servers[0].ServerOwnerID === userId;
    });
    
    res.status(200).json({ channels: filteredChannels });
  } catch (error) {
    next(error);
  }
};

// Get channel by ID
exports.getChannelById = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;
    
    // Check if channel exists
    const channels = await channelService.getChannelById(channelId);
    if (channels.length === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    const channel = channels[0];
    
    // Check if user is a member of the server
    const isMember = await serverService.isServerMember(channel.ServerID, userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this server' });
    }
    
    // Check if channel is private and user has access
    if (channel.IsPrivate) {
      // TODO: Check if user has access to private channel
      // For now, only allow server owner
      const servers = await serverService.getServerById(channel.ServerID);
      if (servers[0].ServerOwnerID !== userId) {
        return res.status(403).json({ message: 'You do not have access to this channel' });
      }
    }
    
    res.status(200).json({
      channel: {
        id: channel.ChannelID,
        name: channel.ChannelName,
        type: channel.ChannelType,
        description: channel.ChannelDescription,
        isPrivate: channel.IsPrivate === 1,
        serverId: channel.ServerID,
        ownerId: channel.ChannelOwnerID,
        createDate: channel.CreateDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update channel
exports.updateChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { channelName, channelDescription, isPrivate } = req.body;
    const userId = req.user.id;
    
    // Check if channel exists
    const channels = await channelService.getChannelById(channelId);
    if (channels.length === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    const channel = channels[0];
    
    // Check if user is the channel owner or server owner
    const servers = await serverService.getServerById(channel.ServerID);
    if (channel.ChannelOwnerID !== userId && servers[0].ServerOwnerID !== userId) {
      return res.status(403).json({ message: 'Only the channel owner or server owner can update the channel' });
    }
    
    // Update channel
    const updated = await channelService.updateChannel(channelId, {
      ChannelName: channelName,
      ChannelDescription: channelDescription,
      IsPrivate: isPrivate
    });
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update channel' });
    }
    
    res.status(200).json({
      message: 'Channel updated successfully',
      channel: {
        id: channelId,
        name: channelName,
        description: channelDescription,
        isPrivate: isPrivate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete channel
exports.deleteChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;
    
    // Check if channel exists
    const channels = await channelService.getChannelById(channelId);
    if (channels.length === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    const channel = channels[0];
    
    // Check if user is the channel owner or server owner
    const servers = await serverService.getServerById(channel.ServerID);
    if (channel.ChannelOwnerID !== userId && servers[0].ServerOwnerID !== userId) {
      return res.status(403).json({ message: 'Only the channel owner or server owner can delete the channel' });
    }
    
    // Delete channel
    const deleted = await channelService.deleteChannel(channelId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete channel' });
    }
    
    res.status(200).json({ message: 'Channel deleted successfully' });
  } catch (error) {
    next(error);
  }
};