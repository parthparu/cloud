const messageService = require("../services/messageService");
const channelService = require("../services/channelService");
const serverService = require("../services/serverService");

// Sending, editing and deleting messages normally happens over the socket
// (socket/messageHandlers.js), which also notifies everyone in the channel live.
// These REST endpoints serve history, plus edit/delete for API clients.

// GET /messages/channels/:channelId/messages?limit=50&before=<messageId>
exports.getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, before = null } = req.query;
    const userId = req.user.id;

    const channels = await channelService.getChannelById(channelId);
    if (!channels || channels.length === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isMember = await serverService.isServerMember(channels[0].ServerID, userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }

    const messages = await messageService.getChannelMessages(channelId, limit, before);
    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

// PUT /messages/messages/:messageId { content }
exports.editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const content = String(req.body.content || "").trim();
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const message = await messageService.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (message.UserID !== userId) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    const updated = await messageService.updateMessage(messageId, { MessageContent: content });
    const updatedMessage = updated ? await messageService.getMessageById(messageId) : null;
    res.status(200).json({ message: "Message updated successfully", updatedMessage });
  } catch (error) {
    next(error);
  }
};

// DELETE /messages/messages/:messageId
exports.deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await messageService.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (message.UserID !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await messageService.deleteMessage(messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
};
