const bcrypt = require('bcryptjs');
const authService = require('../services/authService');
const userService = require('../services/userService');
const twoFactorService = require('../services/twoFactorService');
const tokens = require('../utils/tokens');

// The user object returned after a successful sign-in (password-only or password + 2FA)
const toSessionUser = (user) => ({
  id: user.UserID,
  username: user.Username,
  email: user.Email,
  profilePicture: user.ProfilePicture,
  onlineStatus: 'Online',
  twoFactorEnabled: Boolean(user.TwoFactorEnabled)
});
exports.toSessionUser = toSessionUser;

const USERNAME_PATTERN = /^[a-z0-9_.]{3,24}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    // Validate input
    if (!USERNAME_PATTERN.test(username)) {
      return res.status(400).json({ message: 'Username must be 3-24 characters: letters, numbers, dots or underscores' });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const existingUsername = await userService.getUserByUsername(username);
    if (existingUsername.length > 0) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = await authService.createUser({
      username,
      email,
      password: hashedPassword,
      joinDate: new Date(),
      onlineStatus: 'Offline'
    });

    const token = tokens.signAccessToken(userId);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const users = await userService.getUserByEmail(email);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // With 2FA on, a correct password only earns a short-lived challenge for the code step
    if (await twoFactorService.isEnabled(user.UserID)) {
      return res.status(200).json({
        twoFactorRequired: true,
        challengeToken: tokens.signChallengeToken(user.UserID)
      });
    }

    // Update last login date and online status
    await userService.updateUser(user.UserID, {
      LastLoginDate: new Date(),
      OnlineStatus: 'Online'
    });

    res.status(200).json({
      message: 'Login successful',
      token: tokens.signAccessToken(user.UserID),
      user: toSessionUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
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
        joinDate: user.JoinDate,
        twoFactorEnabled: Boolean(user.TwoFactorEnabled)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Update online status
    await userService.updateUser(userId, {
      OnlineStatus: 'Offline'
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};