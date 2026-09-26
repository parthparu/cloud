const db = require('../config/db');

// Create a new user
exports.createUser = async (userData) => {
  try {
    const { username, email, password, joinDate, onlineStatus } = userData;
    
    const [result] = await db.execute(
      'INSERT INTO Users (Username, Email, Password, JoinDate, OnlineStatus) VALUES (?, ?, ?, ?, ?)',
      [username, email, password, joinDate, onlineStatus]
    );
    
    return result.insertId;
  } catch (error) {
    throw error;
  }
};