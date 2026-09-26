const messageService = require("../services/messageService");
const channelService = require("../services/channelService");
const serverService = require("../services/serverService");
const attachmentService = require("../services/attachmentService");

// Send a message
// filepath: c:\Users\anjal_i5utmff\Desktop\wp_project\backend\src\controllers\messageController.js
exports.sendMessage = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;
    const files = req.files || [];
    const userId = req.user.id;

    if (!content?.trim() && files.length === 0) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const channels = await channelService.getChannelById(channelId);
    if (!channels || channels.length === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const channel = channels[0];
    const isMember = await serverService.isServerMember(channel.ServerID, userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }

    const message = await messageService.createMessage({
      content: content?.trim() || "",
      userId,
      channelId,
      createdAt: new Date(),
    });

    const attachments = [];
    for (const file of files) {
      const attachmentId = await attachmentService.createAttachment({
        messageID: message.MessageID,
        userID: userId,
        fileURL: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadDate: new Date(),
      });

      attachments.push({
        AttachmentID: attachmentId,
        FileURL: file.path,
        FileType: file.mimetype,
        FileSize: file.size,
      });
    }

    res.status(201).json({ message, attachments });
  } catch (error) {
    console.error("Error sending message:", error);
    next(error);
  }
};

exports.getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, before = null } = req.query;
    const userId = req.user.id;

    const channels = await channelService.getChannelById(channelId);
    if (!channels || channels.length === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const channel = channels[0];
    const isMember = await serverService.isServerMember(channel.ServerID, userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }

    const messages = await messageService.getChannelMessages(channelId, limit, before);
    for (const message of messages) {
      message.attachments = await attachmentService.getMessageAttachments(
        message.MessageID
      );
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error getting channel messages:", error);
    next(error);
  }
};

// filepath: c:\Users\anjal_i5utmff\Desktop\wp_project\backend\src\controllers\messageController.js
exports.editMessage = async (req, res, next) => {
  try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Validate message content
      if (!content?.trim()) {
          return res.status(400).json({ message: "Message content cannot be empty" });
      }

      // Check if the message exists and belongs to the user
      const message = await messageService.getMessageById(messageId);
      if (!message) {
          return res.status(404).json({ message: "Message not found" });
      }
      if (message.UserID !== userId) {
          return res.status(403).json({ message: "You can only edit your own messages" });
      }

      // Update the message
      const updated = await messageService.updateMessage(messageId, {
          MessageContent: content.trim(),
      });
      const updatedMessage = updated ? await messageService.getMessageById(messageId) : null;
      res.status(200).json({ message: "Message updated successfully", updatedMessage });
  } catch (error) {
      console.error("Error editing message:", error);
      next(error);
  }
};

// filepath: c:\Users\anjal_i5utmff\Desktop\wp_project\backend\src\controllers\messageController.js
exports.deleteMessage = async (req, res, next) => {
  try {
      const { messageId } = req.params;
      const userId = req.user.id;

      // Check if the message exists
      const message = await messageService.getMessageById(messageId);
      if (!message) {
          return res.status(404).json({ message: "Message not found" });
      }

      // Check if the user is the owner of the message
      if (message.UserID !== userId) {
          return res.status(403).json({ message: "You can only delete your own messages" });
      }

      // Delete the message
      await messageService.deleteMessage(messageId);
      res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
      console.error("Error deleting message:", error);
      next(error);
  }
};

// Pin a message
exports.pinMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Check if the message exists
    const message = await messageService.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Get the channel of the message to check user permissions
    const channel = await channelService.getChannelById(message.ChannelID);
    if (!channel || channel.length === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user is a member of the server
    const isMember = await serverService.isServerMember(channel[0].ServerID, userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }

    // Pin the message
    await messageService.pinMessage(messageId, userId);
    res.status(200).json({ message: "Message pinned successfully" });
  } catch (error) {
    console.error("Error pinning message:", error);
    next(error);
  }
};

// Unpin a message
exports.unpinMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Check if the message exists
    const message = await messageService.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the message is pinned
    const isPinned = await messageService.isMessagePinned(messageId);
    if (!isPinned) {
      return res.status(400).json({ message: "Message is not pinned" });
    }

    // Get the channel of the message to check user permissions
    const channel = await channelService.getChannelById(message.ChannelID);
    if (!channel || channel.length === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user is a member of the server
    const isMember = await serverService.isServerMember(channel[0].ServerID, userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }

    // Unpin the message
    await messageService.unpinMessage(messageId);
    res.status(200).json({ message: "Message unpinned successfully" });
  } catch (error) {
    console.error("Error unpinning message:", error);
    next(error);
  }
};

// Get pinned messages in a channel
exports.getPinnedMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    // Check if the channel exists
    const channels = await channelService.getChannelById(channelId);
    if (!channels || channels.length === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const channel = channels[0];

    // Check if user is a member of the server
    const isMember = await serverService.isServerMember(channel.ServerID, userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }

    // Get pinned messages
    const pinnedMessages = await messageService.getPinnedMessages(channelId);
    res.status(200).json({ pinnedMessages });
  } catch (error) {
    console.error("Error getting pinned messages:", error);
    next(error);
  }
};

// Add reaction to a message
exports.addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    // Validate emoji
    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    // Check if the message exists
    const message = await messageService.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Get the channel of the message to check user permissions
    const channel = await channelService.getChannelById(message.ChannelID);
    if (!channel || channel.length === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user is a member of the server
    const isMember = await serverService.isServerMember(channel[0].ServerID, userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }

    // Add reaction
    const reaction = await messageService.addReaction(messageId, userId, emoji);
    res.status(201).json({ reaction });
  } catch (error) {
    console.error("Error adding reaction:", error);
    next(error);
  }
};

// Remove reaction from a message
exports.removeReaction = async (req, res, next) => {
  try {
    const { messageId, reactionId } = req.params;
    const userId = req.user.id;

    // Check if the message exists
    const message = await messageService.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the reaction exists
    const reaction = await messageService.getReactionById(reactionId);
    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    // Check if the reaction belongs to the user
    if (reaction.UserID !== userId) {
      return res.status(403).json({ message: "You can only remove your own reactions" });
    }

    // Remove reaction
    await messageService.removeReaction(reactionId);
    res.status(200).json({ message: "Reaction removed successfully" });
  } catch (error) {
    console.error("Error removing reaction:", error);
    next(error);
  }
};

// Get reactions for a message
exports.getReactions = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Check if the message exists
    const message = await messageService.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Get the channel of the message to check user permissions
    const channel = await channelService.getChannelById(message.ChannelID);
    if (!channel || channel.length === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user is a member of the server
    const isMember = await serverService.isServerMember(channel[0].ServerID, userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }

    // Get reactions
    const reactions = await messageService.getMessageReactions(messageId);
    res.status(200).json({ reactions });
  } catch (error) {
    console.error("Error getting reactions:", error);
    next(error);
  }
};
