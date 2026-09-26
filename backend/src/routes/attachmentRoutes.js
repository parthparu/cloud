const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Upload attachment
router.post('/messages/:messageId/attachments', auth, upload.single('file'), attachmentController.uploadAttachment);

// Get attachment
router.get('/:attachmentId', attachmentController.getAttachment);

// Delete attachment
router.delete('/:attachmentId', auth, attachmentController.deleteAttachment);

module.exports = router;