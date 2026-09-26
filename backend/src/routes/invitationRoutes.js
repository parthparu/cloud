const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const auth = require('../middleware/auth');

// Invitations to a space, sent to a specific user by username

// My pending invitations
router.get('/', auth, invitationController.list);

// Invite someone: { serverId, username }
router.post('/', auth, invitationController.create);

// Accept or decline one addressed to me
router.post('/:invitationId/accept', auth, invitationController.accept);
router.delete('/:invitationId', auth, invitationController.decline);

module.exports = router;
