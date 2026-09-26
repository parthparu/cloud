// routes/serverRoutes.js
const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create a new server
router.post('/', auth, upload.single('serverIcon'), serverController.createServer);

// Get all servers for a user
router.get('/', auth, serverController.getUserServers);

// Get server by ID
router.get('/:serverId', auth, serverController.getServerById);

// Update server
router.put('/:serverId', auth, upload.single('serverIcon'), serverController.updateServer);

// Delete server
router.delete('/:serverId', auth, serverController.deleteServer);

// Create server invite
router.post('/:serverId/invites', auth, serverController.createInvite);

// Send invite by email (placeholder delivery)
router.post('/:serverId/invites/send', auth, serverController.sendInvite);

// Preview an invite
router.get('/invites/:inviteCode', auth, serverController.getInvite);

// Join server with invite code
router.post('/join', auth, serverController.joinServer);

// Get server members
router.get('/:serverId/members', auth, serverController.getServerMembers);

module.exports = router;