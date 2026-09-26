const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const twoFactorController = require('../controllers/twoFactorController');
const auth = require('../middleware/auth');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Second sign-in step when two-factor authentication is on
router.post('/login/2fa', twoFactorController.completeLogin);

// Two-factor settings for the signed-in user
router.get('/2fa', auth, twoFactorController.getStatus);
router.post('/2fa/setup', auth, twoFactorController.beginSetup);
router.post('/2fa/enable', auth, twoFactorController.enable);
router.post('/2fa/disable', auth, twoFactorController.disable);
router.post('/2fa/recovery-codes', auth, twoFactorController.regenerateRecoveryCodes);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

// Logout
router.post('/logout', auth, authController.logout);

module.exports = router;