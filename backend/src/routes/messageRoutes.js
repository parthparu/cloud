const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// Channel history (sending happens over the socket)
router.get('/channels/:channelId/messages', auth, messageController.getChannelMessages);

// Edit / delete a message
router.put('/messages/:messageId', auth, messageController.editMessage);
router.delete('/messages/:messageId', auth, messageController.deleteMessage);

module.exports = router;
