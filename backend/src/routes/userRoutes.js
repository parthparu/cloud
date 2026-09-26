const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all users
router.get('/', auth, userController.getAllUsers);

// Get user by ID
router.get('/:userId', auth, userController.getUserById);

// Update user profile
router.put('/profile', auth, upload.single('profilePicture'), userController.updateProfile);

// Update user status
router.put('/status', auth, userController.updateStatus);

// Update user settings
router.put('/settings', auth, userController.updateSettings);

module.exports = router;