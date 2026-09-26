const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');

// Send friend request
router.post('/requests', auth, friendController.sendFriendRequest);

// Respond to friend request
router.put('/requests/:friendshipId', auth, friendController.respondToFriendRequest);

// Get all friends
router.get('/', auth, friendController.getFriends);


// Remove friend
router.delete('/:friendshipId', auth, friendController.removeFriend);

// Block user
router.post('/block', auth, friendController.blockUser);

module.exports = router;