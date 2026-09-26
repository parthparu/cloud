const db = require('../config/db');

// Get user by ID
exports.getUserById = async (userId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Users WHERE UserID = ?',
      [userId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get user by email
exports.getUserByEmail = async (email) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Users WHERE LOWER(Email) = LOWER(?)',
      [email]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get user by username
exports.getUserByUsername = async (username) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Users WHERE LOWER(Username) = LOWER(?)',
      [username]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Update user
exports.updateUser = async (userId, userData) => {
  try {
    const keys = Object.keys(userData);
    const values = Object.values(userData);
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const [result] = await db.execute(
      `UPDATE Users SET ${setClause} WHERE UserID = ?`,
      [...values, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Get all users
exports.getAllUsers = async () => {
  try {
    const [rows] = await db.execute(
      'SELECT UserID, Username, ProfilePicture, OnlineStatus, Status FROM Users'
    );
    return rows;
  } catch (error) {
    throw error;
  }
};