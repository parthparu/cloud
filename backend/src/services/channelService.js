const db = require('../config/db');

// Create a new channel
exports.createChannel = async (channelData) => {
  try {
    const { serverID, channelName, channelType, channelDescription, isPrivate, channelOwnerID, createDate } = channelData;
    
    const [result] = await db.execute(
      'INSERT INTO Channels (ServerID, ChannelName, ChannelType, ChannelDescription, IsPrivate, ChannelOwnerID, CreateDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [serverID, channelName, channelType, channelDescription, isPrivate, channelOwnerID, createDate]
    );
    
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get channel by ID
exports.getChannelById = async (channelId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Channels WHERE ChannelID = ?',
      [channelId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get all channels in a server
exports.getServerChannels = async (serverId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Channels WHERE ServerID = ? ORDER BY ChannelType, ChannelName',
      [serverId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Update channel
exports.updateChannel = async (channelId, channelData) => {
  try {
    const keys = Object.keys(channelData);
    const values = Object.values(channelData);
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const [result] = await db.execute(
      `UPDATE Channels SET ${setClause} WHERE ChannelID = ?`,
      [...values, channelId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Delete channel
exports.deleteChannel = async (channelId) => {
  try {
    // Delete all messages in the channel first
    await db.execute('DELETE FROM Messages WHERE ChannelID = ?', [channelId]);
    
    // Delete the channel
    const [result] = await db.execute('DELETE FROM Channels WHERE ChannelID = ?', [channelId]);
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};