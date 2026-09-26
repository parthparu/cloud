// services/serverService.js
const db = require('../config/db');

// Create a server
exports.createServer = async (serverData) => {
  try {
    const { serverName, serverDescription, serverOwnerID, serverIcon, createDate } = serverData;
    
    const [result] = await db.execute(
      'INSERT INTO Servers (ServerName, ServerDesc, ServerOwnerID, ServerIcon, CreateDate) VALUES (?, ?, ?, ?, ?)',
      [serverName, serverDescription, serverOwnerID, serverIcon, createDate]
    );
    
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get server by ID
exports.getServerById = async (serverId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Servers WHERE ServerID = ?',
      [serverId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get all servers for a user
exports.getUserServers = async (userId) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*, sm.Role
       FROM Servers s
       JOIN ServerMembers sm ON s.ServerID = sm.ServerID
       WHERE sm.UserID = ?`,
      [userId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Update server
exports.updateServer = async (serverId, serverData) => {
  try {
    const { ServerName, ServerDesc, ServerIcon } = serverData;
    
    let query = 'UPDATE Servers SET ';
    const params = [];
    
    if (ServerName !== undefined) {
      query += 'ServerName = ?, ';
      params.push(ServerName);
    }
    
    if (ServerDesc !== undefined) {
      query += 'ServerDesc = ?, ';
      params.push(ServerDesc);
    }
    
    if (ServerIcon !== undefined) {
      query += 'ServerIcon = ?, ';
      params.push(ServerIcon);
    }
    
    // Remove trailing comma and space
    query = query.slice(0, -2);
    
    query += ' WHERE ServerID = ?';
    params.push(serverId);
    
    const [result] = await db.execute(query, params);
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Delete server
exports.deleteServer = async (serverId) => {
  try {
    // Delete all channels and messages first
    await db.execute('DELETE FROM Messages WHERE ChannelID IN (SELECT ChannelID FROM Channels WHERE ServerID = ?)', [serverId]);
    await db.execute('DELETE FROM Channels WHERE ServerID = ?', [serverId]);
    
    // Delete server members
    await db.execute('DELETE FROM ServerMembers WHERE ServerID = ?', [serverId]);
    
    // Delete server invites
    await db.execute('DELETE FROM ServerInvites WHERE ServerID = ?', [serverId]);
    
    // Delete the server
    const [result] = await db.execute('DELETE FROM Servers WHERE ServerID = ?', [serverId]);
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Check if user is a member of a server
exports.isServerMember = async (serverId, userId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM ServerMembers WHERE ServerID = ? AND UserID = ?',
      [serverId, userId]
    );
    return rows.length > 0;
  } catch (error) {
    throw error;
  }
};

// Add member to server
exports.addMember = async (serverId, userId, role) => {
  try {
    const [result] = await db.execute(
      'INSERT INTO ServerMembers (ServerID, UserID, Role, JoinDate) VALUES (?, ?, ?, ?)',
      [serverId, userId, role, new Date()]
    );
    
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get server members
exports.getServerMembers = async (serverId) => {
  try {
    const [rows] = await db.execute(
      `SELECT sm.*, u.Username, u.ProfilePicture, u.OnlineStatus
       FROM ServerMembers sm
       JOIN Users u ON sm.UserID = u.UserID
       WHERE sm.ServerID = ?`,
      [serverId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Create channel
exports.createChannel = async (channelData) => {
  try {
    const { serverID, channelName, channelType, channelDescription, isPrivate, channelOwnerID } = channelData;
    
    const [result] = await db.execute(
      'INSERT INTO Channels (ServerID, ChannelName, ChannelType, ChannelDescription, IsPrivate, ChannelOwnerID) VALUES (?, ?, ?, ?, ?, ?)',
      [serverID, channelName, channelType, channelDescription, isPrivate, channelOwnerID]
    );
    
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Create invite
exports.createInvite = async (inviteData) => {
  try {
    const { serverID, inviteCode, creatorID, createDate, expiryDate } = inviteData;
    
    const [result] = await db.execute(
      'INSERT INTO ServerInvites (ServerID, InviteCode, CreatorID, CreateDate, ExpiryDate) VALUES (?, ?, ?, ?, ?)',
      [serverID, inviteCode, creatorID, createDate, expiryDate]
    );
    
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get invite by code
exports.getInviteByCode = async (inviteCode) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM ServerInvites WHERE InviteCode = ?',
      [inviteCode]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};