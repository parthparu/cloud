const dmService = require('../services/dmService');
const userService = require('../services/userService');
const attachmentService = require('../services/attachmentService');
const { getIo } = require('../socket/socket');

// 🔧 Replace with a real user ID from your database
const MOCK_USER_ID = "1";

// Get or create DM channel
exports.getOrCreateDMChannel = async (req, res, next) => {
  try {
    req.user = { id: MOCK_USER_ID };

    const { userId } = req.params;
    const currentUserId = req.user.id;

    const users = await userService.getUserById(userId);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'You cannot DM yourself' });
    }

    const existingChannels = await dmService.getDMChannel(currentUserId, userId);
    let channelId;

    if (existingChannels.length > 0) {
      channelId = existingChannels[0].ChannelID;
    } else {
      channelId = await dmService.createDMChannel({
        user1ID: currentUserId,
        user2ID: userId,
        createDate: new Date()
      });
    }

    const targetUser = users[0];

    res.status(200).json({
      channel: {
        id: channelId,
        type: 'DM',
        recipient: {
          id: targetUser.UserID,
          username: targetUser.Username,
          profilePicture: targetUser.ProfilePicture,
          onlineStatus: targetUser.OnlineStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all DM channels for a user
exports.getUserDMChannels = async (req, res, next) => {
  try {
    req.user = { id: MOCK_USER_ID };

    const userId = req.user.id;
    const channels = await dmService.getUserDMChannels(userId);

    const formattedChannels = channels.map(channel => ({
      id: channel.ChannelID,
      type: channel.IsGroup ? 'Group' : 'DM',
      recipient: channel.IsGroup ? null : {
        id: channel.UserID,
        username: channel.Username,
        profilePicture: channel.ProfilePicture,
        onlineStatus: channel.OnlineStatus
      },
      group: channel.IsGroup ? {
        name: channel.GroupName,
        icon: channel.GroupIcon,
        ownerID: channel.OwnerID
      } : null,
      lastMessage: channel.LastMessage,
      lastMessageDate: channel.LastMessageDate
    }));

    res.status(200).json({ channels: formattedChannels });
  } catch (error) {
    next(error);
  }
};

// Send a direct message
exports.sendDirectMessage = async (req, res, next) => {
  try {
    req.user = { id: MOCK_USER_ID };

    const { channelId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const channels = await dmService.getDMChannelById(channelId);
    if (channels.length === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const channel = channels[0];

    if (channel.User1ID !== userId && channel.User2ID !== userId) {
      return res.status(403).json({ message: 'You are not a participant in this channel' });
    }

    const messageId = await dmService.createDirectMessage({
      channelID: channelId,
      userID: userId,
      messageContent: content,
      messageDate: new Date()
    });

    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileType = file.mimetype.startsWith('image/') ? 'Image' : 
                        file.mimetype.startsWith('video/') ? 'Video' : 'Document';

        const attachmentId = await attachmentService.createAttachment({
          messageID: messageId,
          userID: userId,
          fileURL: file.path,
          fileType,
          fileSize: file.size,
          uploadDate: new Date()
        });

        attachments.push({
          id: attachmentId,
          fileURL: file.path,
          fileType,
          fileSize: file.size
        });
      }
    }

    const users = await userService.getUserById(userId);
    const user = users[0];

    const messageData = {
      id: messageId,
      content,
      channelId,
      userId,
      username: user.Username,
      profilePicture: user.ProfilePicture,
      timestamp: new Date(),
      attachments
    };

    const io = getIo();
    const recipientId = channel.User1ID === userId ? channel.User2ID : channel.User1ID;

    io.to(`user:${recipientId}`).emit('dm:message', messageData);

    res.status(201).json({
      message: 'Message sent successfully',
      messageData
    });
  } catch (error) {
    next(error);
  }
};

// Get messages in a DM channel
exports.getDMMessages = async (req, res, next) => {
  try {
    req.user = { id: MOCK_USER_ID };

    const { channelId } = req.params;
    const userId = req.user.id;
    const { limit = 50, before } = req.query;

    const channels = await dmService.getDMChannelById(channelId);
    if (channels.length === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const channel = channels[0];

    if (channel.User1ID !== userId && channel.User2ID !== userId) {
      return res.status(403).json({ message: 'You are not a participant in this channel' });
    }

    const messages = await dmService.getDMMessages(channelId, limit, before);

    for (const message of messages) {
      const attachments = await attachmentService.getMessageAttachments(message.MessageID);
      message.attachments = attachments;
    }

    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

// Create group DM
exports.createGroupDM = async (req, res, next) => {
  try {
    req.user = { id: MOCK_USER_ID };

    const { userIds, groupName } = req.body;
    const userId = req.user.id;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ message: 'At least one user is required' });
    }

    for (const id of userIds) {
      const users = await userService.getUserById(id);
      if (users.length === 0) {
        return res.status(404).json({ message: `User with ID ${id} not found` });
      }
    }

    const channelId = await dmService.createGroupDMChannel({
      ownerID: userId,
      groupName,
      createDate: new Date()
    });

    await dmService.addUserToGroupDM(channelId, userId);

    for (const id of userIds) {
      await dmService.addUserToGroupDM(channelId, id);
    }

    const io = getIo();
    for (const id of userIds) {
      io.to(`user:${id}`).emit('dm:group-created', {
        channelId,
        groupName,
        ownerId: userId
      });
    }

    res.status(201).json({
      message: 'Group DM created successfully',
      channel: {
        id: channelId,
        type: 'Group',
        groupName,
        ownerId: userId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add user to group DM
exports.addUserToGroupDM = async (req, res, next) => {
  try {
    req.user = { id: MOCK_USER_ID };

    const { channelId } = req.params;
    const { userId: targetUserId } = req.body;
    const userId = req.user.id;

    const channels = await dmService.getGroupDMChannelById(channelId);
    if (channels.length === 0) {
      return res.status(404).json({ message: 'Group DM not found' });
    }

    const channel = channels[0];

    if (channel.OwnerID !== userId) {
      return res.status(403).json({ message: 'Only the group owner can add users' });
    }

    const users = await userService.getUserById(targetUserId);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isInGroup = await dmService.isUserInGroupDM(channelId, targetUserId);
    if (isInGroup) {
      return res.status(400).json({ message: 'User is already in the group' });
    }

    await dmService.addUserToGroupDM(channelId, targetUserId);

    const groupUsers = await dmService.getGroupDMUsers(channelId);
    const io = getIo();

    for (const groupUser of groupUsers) {
      io.to(`user:${groupUser.UserID}`).emit('dm:user-added', {
        channelId,
        user: {
          id: targetUserId,
          username: users[0].Username,
          profilePicture: users[0].ProfilePicture
        }
      });
    }

    io.to(`user:${targetUserId}`).emit('dm:added-to-group', {
      channelId,
      groupName: channel.GroupName,
      ownerId: channel.OwnerID
    });

    res.status(200).json({
      message: 'User added to group successfully',
      user: {
        id: targetUserId,
        username: users[0].Username,
        profilePicture: users[0].ProfilePicture
      }
    });
  } catch (error) {
    next(error);
  }
};

// Remove user from group DM
exports.removeUserFromGroupDM = async (req, res, next) => {
  try {
    req.user = { id: MOCK_USER_ID };

    const { channelId, userId: targetUserId } = req.params;
    const userId = req.user.id;

    const channels = await dmService.getGroupDMChannelById(channelId);
    if (channels.length === 0) {
      return res.status(404).json({ message: 'Group DM not found' });
    }

    const channel = channels[0];

    if (channel.OwnerID !== userId && targetUserId !== userId) {
      return res.status(403).json({ message: 'Only the group owner can remove users' });
    }

    const isInGroup = await dmService.isUserInGroupDM(channelId, targetUserId);
    if (!isInGroup) {
      return res.status(400).json({ message: 'User is not in the group' });
    }

    await dmService.removeUserFromGroupDM(channelId, targetUserId);

    if (targetUserId === channel.OwnerID) {
      const remainingUsers = await dmService.getGroupDMUsers(channelId);

      if (remainingUsers.length > 0) {
        await dmService.updateGroupDMOwner(channelId, remainingUsers[0].UserID);
      } else {
        await dmService.deleteGroupDM(channelId);
      }
    }

    const groupUsers = await dmService.getGroupDMUsers(channelId);
    const io = getIo();

    for (const groupUser of groupUsers) {
      io.to(`user:${groupUser.UserID}`).emit('dm:user-removed', {
        channelId,
        userId: targetUserId
      });
    }

    io.to(`user:${targetUserId}`).emit('dm:removed-from-group', {
      channelId
    });

    res.status(200).json({
      message: 'User removed from group successfully'
    });
  } catch (error) {
    next(error);
  }
};
