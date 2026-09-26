const db = require('../config/db');

// Create a new message
exports.createMessage = async (messageData) => {
  try {
    const channelID = messageData.channelID || messageData.channelId;
    const userID = messageData.userID || messageData.userId;
    const messageContent = messageData.messageContent || messageData.content;
    const messageDate = messageData.messageDate || messageData.createdAt || new Date();
    
    const [result] = await db.execute(
      'INSERT INTO Messages (ChannelID, UserID, MessageContent, MessageDate) VALUES (?, ?, ?, ?)',
      [channelID, userID, messageContent, messageDate]
    );
    
    return {
      MessageID: result.insertId,
      ChannelID: channelID,
      UserID: userID,
      MessageContent: messageContent,
      MessageDate: messageDate,
    };
  } catch (error) {
    throw error;
  }
};

// Get message by ID
exports.getMessageById = async (messageId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Messages WHERE MessageID = ?',
      [messageId]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// Get messages in a channel
exports.getChannelMessages = async (channelId, limit = 50, before = null) => {
  try {
    let query = `
      SELECT m.*, u.Username, u.ProfilePicture
      FROM Messages m
      JOIN Users u ON m.UserID = u.UserID
      WHERE m.ChannelID = ?
    `;
    
    const params = [channelId];
    
    if (before) {
      query += ' AND m.MessageID < ?';
      params.push(before);
    }
    
    query += ' ORDER BY m.MessageDate DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [rows] = await db.execute(query, params);
    return rows.reverse();
  } catch (error) {
    throw error;
  }
};

// Update message
exports.updateMessage = async (messageId, messageData) => {
  try {
    const keys = Object.keys(messageData);
    const values = Object.values(messageData);
    if (keys.length === 0) {
      return false;
    }
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const [result] = await db.execute(
      `UPDATE Messages SET ${setClause} WHERE MessageID = ?`,
      [...values, messageId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Delete message
exports.deleteMessage = async (messageId) => {
  try {
    // Delete attachments first
    await db.execute('DELETE FROM Attachments WHERE MessageID = ?', [messageId]);
    
    // Delete the message
    const [result] = await db.execute('DELETE FROM Messages WHERE MessageID = ?', [messageId]);
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};
