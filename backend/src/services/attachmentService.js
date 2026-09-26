const db = require('../config/db');

// Create a new attachment
exports.createAttachment = async (attachmentData) => {
  try {
    const { messageID, userID, fileURL, fileType, fileSize, uploadDate } = attachmentData;
    
    const [result] = await db.execute(
      'INSERT INTO Attachments (MessageID, UserID, FileURL, FileType, FileSize, UploadDate) VALUES (?, ?, ?, ?, ?, ?)',
      [messageID, userID, fileURL, fileType, fileSize, uploadDate]
    );
    
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get attachment by ID
exports.getAttachmentById = async (attachmentId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Attachments WHERE AttachmentID = ?',
      [attachmentId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get attachments for a message
exports.getMessageAttachments = async (messageId) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM Attachments WHERE MessageID = ?',
      [messageId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Delete attachment
exports.deleteAttachment = async (attachmentId) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM Attachments WHERE AttachmentID = ?',
      [attachmentId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};