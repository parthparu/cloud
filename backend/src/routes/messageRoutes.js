const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Send a message
router.post('/channels/:channelId/messages', auth, upload.array('attachments', 5), messageController.sendMessage);

// Get messages in a channel
router.get('/channels/:channelId/messages', auth, messageController.getChannelMessages);

// Edit a message
router.put('/messages/:messageId', auth, messageController.editMessage);

// Delete a message
router.delete('/messages/:messageId', auth, messageController.deleteMessage);

// Pin a message
router.post('/messages/:messageId/pin', auth, messageController.pinMessage);

// Unpin a message
router.delete('/messages/:messageId/pin', auth, messageController.unpinMessage);

// Get pinned messages in a channel
router.get('/channels/:channelId/pins', auth, messageController.getPinnedMessages);

// React to a message
router.post('/messages/:messageId/reactions', auth, messageController.addReaction);

// Remove reaction from a message
router.delete('/messages/:messageId/reactions/:reactionId', auth, messageController.removeReaction);

// Get reactions for a message
router.get('/messages/:messageId/reactions', auth, messageController.getReactions);

module.exports = router;
