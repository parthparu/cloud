const userService = require('../services/userService');
const fs = require('fs');

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const users = await userService.getUserById(userId);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    res.status(200).json({
      user: {
        id: user.UserID,
        username: user.Username,
        email: user.Email,
        profilePicture: user.ProfilePicture,
        aboutMe: user.AboutMe,
        status: user.Status,
        onlineStatus: user.OnlineStatus,
        joinDate: user.JoinDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, aboutMe, status } = req.body;
    
    // Check if username is already taken
    if (username) {
      const existingUser = await userService.getUserByUsername(username);
      if (existingUser.length > 0 && existingUser[0].UserID !== userId) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }
    
    // Update profile picture if provided
    let profilePicture = undefined;
    if (req.file) {
      // Get current profile picture
      const users = await userService.getUserById(userId);
      const currentPicture = users[0].ProfilePicture;
      
      // Delete old profile picture if it exists
      if (currentPicture && fs.existsSync(currentPicture) && !currentPicture.includes('placeholder')) {
        fs.unlinkSync(currentPicture);
      }
      
      profilePicture = req.file.path;
    }
    
    // Update user
    const updated = await userService.updateUser(userId, {
      Username: username,
      AboutMe: aboutMe,
      Status: status,
      ProfilePicture: profilePicture
    });
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update profile' });
    }
    
    // Get updated user
    const users = await userService.getUserById(userId);
    const user = users[0];
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.UserID,
        username: user.Username,
        email: user.Email,
        profilePicture: user.ProfilePicture,
        aboutMe: user.AboutMe,
        status: user.Status
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user status
exports.updateStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { onlineStatus } = req.body;
    
    // Validate status
    const validStatuses = ['Online', 'Idle', 'Do Not Disturb', 'Offline'];
    if (!validStatuses.includes(onlineStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Update status
    const updated = await userService.updateUser(userId, {
      OnlineStatus: onlineStatus
    });
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update status' });
    }
    
    res.status(200).json({
      message: 'Status updated successfully',
      status: onlineStatus
    });
  } catch (error) {
    next(error);
  }
};

// Update user settings
exports.updateSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { theme, language, notifications } = req.body;
    
    // Update settings
    // Note: This would require a UserSettings table in the database
    // For now, we'll just return a success message
    
    res.status(200).json({
      message: 'Settings updated successfully',
      settings: {
        theme,
        language,
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
};