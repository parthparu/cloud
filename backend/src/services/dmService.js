const db = require('../config/db');

// -------------------- Direct Message Channels (One-to-One) --------------------

// Create a DM channel
exports.createDMChannel = async (channelData) => {
  try {
    const { user1ID, user2ID, createDate } = channelData;

    const [result] = await db.execute(
      'INSERT INTO DirectMessageChannels (User1ID, User2ID, CreateDate) VALUES (?, ?, ?)',
      [user1ID, user2ID, createDate]
    );

    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get DM channel between two users
exports.getDMChannel = async (user1ID, user2ID) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM DirectMessageChannels WHERE (User1ID = ? AND User2ID = ?) OR (User1ID = ? AND User2ID = ?)',
      [user1ID, user2ID, user2ID, user1ID]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get DM channel by ID
exports.getDMChannelById = async (channelId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM DirectMessageChannels WHERE ChannelID = ?',
      [channelId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get all DM channels for a user (including groups)
exports.getUserDMChannels = async (userId) => {
  try {
    const [rows] = await db.execute(
      `SELECT dmc.ChannelID, dmc.IsGroup, dmc.GroupName, dmc.GroupIcon, dmc.OwnerID,
              u.UserID, u.Username, u.ProfilePicture, u.OnlineStatus,
              (SELECT MessageContent FROM DirectMessages 
               WHERE ChannelID = dmc.ChannelID 
               ORDER BY MessageDate DESC LIMIT 1) AS LastMessage,
              (SELECT MessageDate FROM DirectMessages 
               WHERE ChannelID = dmc.ChannelID 
               ORDER BY MessageDate DESC LIMIT 1) AS LastMessageDate
       FROM DirectMessageChannels dmc
       LEFT JOIN Users u ON (dmc.User1ID = u.UserID OR dmc.User2ID = u.UserID) AND u.UserID != ?
       WHERE dmc.User1ID = ? OR dmc.User2ID = ? OR dmc.ChannelID IN (
         SELECT ChannelID FROM GroupDMUsers WHERE UserID = ?
       )`,
      [userId, userId, userId, userId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// -------------------- Direct Messages --------------------

// Create a direct message
exports.createDirectMessage = async (messageData) => {
  try {
    const { channelID, userID, messageContent, messageDate } = messageData;

    const [result] = await db.execute(
      'INSERT INTO DirectMessages (ChannelID, UserID, MessageContent, MessageDate) VALUES (?, ?, ?, ?)',
      [channelID, userID, messageContent, messageDate]
    );

    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get messages in a DM channel (with pagination)
exports.getDMMessages = async (channelId, limit = 50, before = null) => {
  try {
    let query = `
      SELECT dm.*, u.Username, u.ProfilePicture
      FROM DirectMessages dm
      JOIN Users u ON dm.UserID = u.UserID
      WHERE dm.ChannelID = ?
    `;

    const params = [channelId];

    if (before) {
      query += ' AND dm.MessageID < ?';
      params.push(before);
    }

    query += ' ORDER BY dm.MessageDate DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await db.execute(query, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

// -------------------- Group DM Channels --------------------

// Create a group DM channel
exports.createGroupDMChannel = async (channelData) => {
  try {
    const { ownerID, groupName, createDate } = channelData;

    const [result] = await db.execute(
      'INSERT INTO DirectMessageChannels (IsGroup, GroupName, OwnerID, CreateDate) VALUES (?, ?, ?, ?)',
      [true, groupName, ownerID, createDate]
    );

    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get group DM channel by ID
exports.getGroupDMChannelById = async (channelId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM DirectMessageChannels WHERE ChannelID = ? AND IsGroup = true',
      [channelId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Add user to group DM
exports.addUserToGroupDM = async (channelId, userId) => {
  try {
    const [result] = await db.execute(
      'INSERT INTO GroupDMUsers (ChannelID, UserID, JoinDate) VALUES (?, ?, ?)',
      [channelId, userId, new Date()]
    );

    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Check if user is in group DM
exports.isUserInGroupDM = async (channelId, userId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM GroupDMUsers WHERE ChannelID = ? AND UserID = ?',
      [channelId, userId]
    );
    return rows.length > 0;
  } catch (error) {
    throw error;
  }
};

// Get users in a group DM
exports.getGroupDMUsers = async (channelId) => {
  try {
    const [rows] = await db.execute(
      `SELECT gdu.*, u.Username, u.ProfilePicture, u.OnlineStatus
       FROM GroupDMUsers gdu
       JOIN Users u ON gdu.UserID = u.UserID
       WHERE gdu.ChannelID = ?`,
      [channelId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Remove user from group DM
exports.removeUserFromGroupDM = async (channelId, userId) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM GroupDMUsers WHERE ChannelID = ? AND UserID = ?',
      [channelId, userId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Update group DM owner
exports.updateGroupDMOwner = async (channelId, newOwnerId) => {
  try {
    const [result] = await db.execute(
      'UPDATE DirectMessageChannels SET OwnerID = ? WHERE ChannelID = ?',
      [newOwnerId, channelId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Delete group DM and related data
exports.deleteGroupDM = async (channelId) => {
  try {
    await db.execute('DELETE FROM DirectMessages WHERE ChannelID = ?', [channelId]);
    await db.execute('DELETE FROM GroupDMUsers WHERE ChannelID = ?', [channelId]);
    const [result] = await db.execute('DELETE FROM DirectMessageChannels WHERE ChannelID = ?', [channelId]);

    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};
