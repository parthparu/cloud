// controllers/serverController.js
const crypto = require('crypto');
const serverService = require('../services/serverService');
const inviteDelivery = require('../services/inviteDelivery');
const fs = require('fs');

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Create a new server
exports.createServer = async (req, res, next) => {
  try {
    const serverName = String(req.body.serverName || '').trim();
    const serverDescription = req.body.serverDescription;
    const userId = req.user.id;
    
    // Validate input
    if (!serverName || serverName.length > 60) {
      return res.status(400).json({ message: 'Space name is required (max 60 characters)' });
    }
    
    // Handle server icon if provided
    let serverIcon = null;
    if (req.file) {
      serverIcon = req.file.path;
    }
    
    // Create server
    const serverId = await serverService.createServer({
      serverName,
      serverDescription,
      serverOwnerID: userId,
      serverIcon,
      createDate: new Date()
    });
    
    // Create default channels
    await serverService.createChannel({
      serverID: serverId,
      channelName: 'general',
      channelType: 'Text',
      channelDescription: 'General discussion',
      isPrivate: false,
      channelOwnerID: userId
    });
    
    // Add owner as member with admin role
    await serverService.addMember(serverId, userId, 'Admin');
    
    res.status(201).json({
      message: 'Server created successfully',
      server: {
        id: serverId,
        name: serverName,
        description: serverDescription,
        icon: serverIcon,
        ownerId: userId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all servers for a user
exports.getUserServers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const servers = await serverService.getUserServers(userId);
    
    res.status(200).json({ servers });
  } catch (error) {
    next(error);
  }
};

// Get server by ID
exports.getServerById = async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const userId = req.user.id;
    
    // Check if server exists
    const servers = await serverService.getServerById(serverId);
    if (servers.length === 0) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    const server = servers[0];
    
    // Check if user is a member
    const isMember = await serverService.isServerMember(serverId, userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this server' });
    }
    
    res.status(200).json({ server });
  } catch (error) {
    next(error);
  }
};

// Update server
exports.updateServer = async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const { serverName, serverDescription } = req.body;
    const userId = req.user.id;
    
    // Check if server exists
    const servers = await serverService.getServerById(serverId);
    if (servers.length === 0) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    const server = servers[0];
    
    // Check if user is the owner
    if (server.ServerOwnerID !== userId) {
      return res.status(403).json({ message: 'Only the server owner can update the server' });
    }
    
    // Handle server icon if provided
    let serverIcon = undefined;
    if (req.file) {
      // Delete old icon if it exists
      if (server.ServerIcon && fs.existsSync(server.ServerIcon)) {
        fs.unlinkSync(server.ServerIcon);
      }
      
      serverIcon = req.file.path;
    }
    
    // Update server
    const updated = await serverService.updateServer(serverId, {
      ServerName: serverName,
      ServerDesc: serverDescription,
      ServerIcon: serverIcon
    });
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update server' });
    }
    
    res.status(200).json({
      message: 'Server updated successfully',
      server: {
        id: serverId,
        name: serverName || server.ServerName,
        description: serverDescription || server.ServerDesc,
        icon: serverIcon || server.ServerIcon,
        ownerId: server.ServerOwnerID
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete server
exports.deleteServer = async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const userId = req.user.id;
    
    // Check if server exists
    const servers = await serverService.getServerById(serverId);
    if (servers.length === 0) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    const server = servers[0];
    
    // Check if user is the owner
    if (server.ServerOwnerID !== userId) {
      return res.status(403).json({ message: 'Only the server owner can delete the server' });
    }
    
    // Delete server
    const deleted = await serverService.deleteServer(serverId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete server' });
    }
    
    // Delete server icon if it exists
    if (server.ServerIcon && fs.existsSync(server.ServerIcon)) {
      fs.unlinkSync(server.ServerIcon);
    }
    
    res.status(200).json({
      message: 'Server deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create server invite
exports.createInvite = async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const userId = req.user.id;
    
    // Check if server exists
    const servers = await serverService.getServerById(serverId);
    if (servers.length === 0) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    // Check if user is a member
    const isMember = await serverService.isServerMember(serverId, userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this server' });
    }
    
    // Generate an unguessable invite code
    const inviteCode = crypto.randomBytes(6).toString('base64url');
    const expiryDate = new Date(Date.now() + INVITE_TTL_MS);
    
    // Save invite
    await serverService.createInvite({
      serverID: serverId,
      inviteCode,
      creatorID: userId,
      createDate: new Date(),
      expiryDate
    });
    
    res.status(201).json({
      message: 'Invite created successfully',
      invite: {
        code: inviteCode,
        expires: expiryDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Send an invite by email — placeholder until a delivery provider is chosen
exports.sendInvite = async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const email = String(req.body.email || '').trim();
    const inviteCode = String(req.body.inviteCode || '').trim();
    const userId = req.user.id;
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    
    const isMember = await serverService.isServerMember(serverId, userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this server' });
    }
    
    const invites = await serverService.getInviteByCode(inviteCode);
    if (invites.length === 0 || String(invites[0].ServerID) !== String(serverId)) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }
    
    const result = await inviteDelivery.sendInviteEmail({ to: email, inviteCode, serverId });
    
    res.status(result.delivered ? 200 : 202).json(result);
  } catch (error) {
    next(error);
  }
};

// Preview an invite (no membership required) so the join page can show the space name
exports.getInvite = async (req, res, next) => {
  try {
    const invites = await serverService.getInviteByCode(req.params.inviteCode);
    if (invites.length === 0 || new Date(invites[0].ExpiryDate) < new Date()) {
      return res.status(404).json({ message: 'This invite is invalid or has expired' });
    }
    
    const servers = await serverService.getServerById(invites[0].ServerID);
    const members = await serverService.getServerMembers(invites[0].ServerID);
    
    res.status(200).json({
      invite: {
        code: invites[0].InviteCode,
        expires: invites[0].ExpiryDate,
        server: {
          id: servers[0].ServerID,
          name: servers[0].ServerName,
          description: servers[0].ServerDesc,
          memberCount: members.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Join server with invite code
exports.joinServer = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;
    
    // Check if invite exists and is valid
    const invites = await serverService.getInviteByCode(inviteCode);
    if (invites.length === 0) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }
    
    const invite = invites[0];
    
    // Check if invite has expired
    if (new Date(invite.ExpiryDate) < new Date()) {
      return res.status(400).json({ message: 'Invite has expired' });
    }
    
    const serverId = invite.ServerID;
    
    // Check if user is already a member
    // Joining twice is harmless: the invite link simply takes existing members to the space
    const isMember = await serverService.isServerMember(serverId, userId);
    if (!isMember) {
      await serverService.addMember(serverId, userId, 'Member');
    }
    
    // Get server details
    const servers = await serverService.getServerById(serverId);
    const server = servers[0];
    
    res.status(200).json({
      message: isMember ? 'Already a member' : 'Joined server successfully',
      alreadyMember: isMember,
      server: {
        id: serverId,
        name: server.ServerName,
        description: server.ServerDesc,
        icon: server.ServerIcon,
        ownerId: server.ServerOwnerID
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get server members
exports.getServerMembers = async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const userId = req.user.id;
    
    // Check if server exists
    const servers = await serverService.getServerById(serverId);
    if (servers.length === 0) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    // Check if user is a member
    const isMember = await serverService.isServerMember(serverId, userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this server' });
    }
    
    // Get members
    const members = await serverService.getServerMembers(serverId);
    
    res.status(200).json({ members });
  } catch (error) {
    next(error);
  }
};