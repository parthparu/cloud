const attachmentService = require('../services/attachmentService');
const messageService = require('../services/messageService');
const path = require('path');
const fs = require('fs');

exports.uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { messageId } = req.params;
    const userId = req.user.id;
    
    // Check if message exists
    const messages = await messageService.getMessageById(messageId);
    if (messages.length === 0) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const message = messages[0];
    
    // Check if user is the message author
    if (message.UserID !== userId) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'You can only add attachments to your own messages' });
    }
    
    // Determine file type
    const fileType = req.file.mimetype.startsWith('image/') ? 'Image' : 
                    req.file.mimetype.startsWith('video/') ? 'Video' : 'Document';
    
    // Create attachment
    const attachmentId = await attachmentService.createAttachment({
      messageID: messageId,
      userID: userId,
      fileURL: req.file.path,
      fileType,
      fileSize: req.file.size,
      uploadDate: new Date()
    });
    
    res.status(201).json({
      message: 'Attachment uploaded successfully',
      attachment: {
        id: attachmentId,
        fileURL: req.file.path,
        fileType,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    // Delete uploaded file if it exists
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// Get attachment
exports.getAttachment = async (req, res, next) => {
  try {
    const { attachmentId } = req.params;
    
    // Check if attachment exists
    const attachments = await attachmentService.getAttachmentById(attachmentId);
    if (attachments.length === 0) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    
    const attachment = attachments[0];
    
    // Check if file exists
    if (!fs.existsSync(attachment.FileURL)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Send file
    res.sendFile(path.resolve(attachment.FileURL));
  } catch (error) {
    next(error);
  }
};

// Delete attachment
exports.deleteAttachment = async (req, res, next) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.id;
    
    // Check if attachment exists
    const attachments = await attachmentService.getAttachmentById(attachmentId);
    if (attachments.length === 0) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    
    const attachment = attachments[0];
    
    // Check if user is the attachment owner
    if (attachment.UserID !== userId) {
      return res.status(403).json({ message: 'You can only delete your own attachments' });
    }
    
    // Delete file
    if (fs.existsSync(attachment.FileURL)) {
      fs.unlinkSync(attachment.FileURL);
    }
    
    // Delete attachment from database
    const deleted = await attachmentService.deleteAttachment(attachmentId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete attachment' });
    }
    
    res.status(200).json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    next(error);
  }
};