const db = require('../config/db');

// Create a new friendship
exports.createFriendship = async (friendshipData) => {
  try {
    const { userID1, userID2, friendshipStatus, friendshipDate } = friendshipData;
    
    const [result] = await db.execute(
      'INSERT INTO Friends (UserID1, UserID2, FriendshipStatus, FriendshipDate) VALUES (?, ?, ?, ?)',
      [userID1, userID2, friendshipStatus, friendshipDate]
    );
    
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get friendship by ID
exports.getFriendshipById = async (friendshipId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Friends WHERE FriendshipID = ?',
      [friendshipId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get friendship between two users
exports.getFriendship = async (userId1, userId2) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Friends WHERE (UserID1 = ? AND UserID2 = ?) OR (UserID1 = ? AND UserID2 = ?)',
      [userId1, userId2, userId2, userId1]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get all friendships for a user
exports.getUserFriendships = async (userId) => {
  try {
    const [rows] = await db.execute(
      `SELECT f.*, 
              u.Username, u.ProfilePicture, u.OnlineStatus
       FROM Friends f
       JOIN Users u ON (f.UserID1 = u.UserID OR f.UserID2 = u.UserID) AND u.UserID != ?
       WHERE (f.UserID1 = ? OR f.UserID2 = ?)`,
      [userId, userId, userId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Update friendship
exports.updateFriendship = async (friendshipId, friendshipData) => {
  try {
    const keys = Object.keys(friendshipData);
    const values = Object.values(friendshipData);
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const [result] = await db.execute(
      `UPDATE Friends SET ${setClause} WHERE FriendshipID = ?`,
      [...values, friendshipId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Delete friendship
exports.deleteFriendship = async (friendshipId) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM Friends WHERE FriendshipID = ?',
      [friendshipId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};