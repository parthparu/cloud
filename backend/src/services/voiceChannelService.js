const db = require('../config/db');

// Get voice channel by ID
exports.getVoiceChannelById = async (channelId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM VoiceChannels WHERE VoiceChannelID = ?',
      [channelId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Add user to voice channel
exports.addUserToVoiceChannel = async (participantData) => {
  try {
    const { voiceChannelID, userID, joinTime, isMuted, isDeafened } = participantData;
    
    const [result] = await db.execute(
      'INSERT INTO VoiceChannelParticipants (VoiceChannelID, UserID, JoinTime, IsMuted, IsDeafened) VALUES (?, ?, ?, ?, ?)',
      [voiceChannelID, userID, joinTime, isMuted, isDeafened]
    );
    
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get voice channel participants
exports.getVoiceChannelParticipants = async (channelId) => {
  try {
    const [rows] = await db.execute(
      `SELECT vcp.*, u.Username, u.ProfilePicture
       FROM VoiceChannelParticipants vcp
       JOIN Users u ON vcp.UserID = u.UserID
       WHERE vcp.VoiceChannelID = ? AND vcp.LeaveTime IS NULL`,
      [channelId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Update voice channel participant
exports.updateVoiceChannelParticipant = async (channelId, userId, participantData) => {
  try {
    const keys = Object.keys(participantData);
    const values = Object.values(participantData);
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const [result] = await db.execute(
      `UPDATE VoiceChannelParticipants SET ${setClause} 
       WHERE VoiceChannelID = ? AND UserID = ? AND LeaveTime IS NULL`,
      [...values, channelId, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};