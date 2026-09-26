const friendService = require('../services/friendService');
const userService = require('../services/userService');
const { getIo } = require('../socket/socket');

// Send friend request
exports.sendFriendRequest = async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const userId = req.user.id;
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    // Check if user exists
    const users = await userService.getUserByUsername(username);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const targetUser = users[0];
    
    // Check if trying to add self
    if (targetUser.UserID === userId) {
      return res.status(400).json({ message: 'You cannot add yourself as a friend' });
    }
    
    // Check if friendship already exists
    const existingFriendship = await friendService.getFriendship(userId, targetUser.UserID);
    if (existingFriendship.length > 0) {
      const friendship = existingFriendship[0];
      
      if (friendship.FriendshipStatus === 'Accepted') {
        return res.status(400).json({ message: 'You are already friends with this user' });
      }
      
      if (friendship.FriendshipStatus === 'Pending') {
        if (friendship.UserID1 === userId) {
          return res.status(400).json({ message: 'Friend request already sent' });
        } else {
          return res.status(400).json({ message: 'This user has already sent you a friend request' });
        }
      }
      
      if (friendship.FriendshipStatus === 'Blocked') {
        return res.status(400).json({ message: 'You cannot send a friend request to this user' });
      }
    }
    
    // Create friend request
    const friendshipId = await friendService.createFriendship({
      userID1: userId,
      userID2: targetUser.UserID,
      friendshipStatus: 'Pending',
      friendshipDate: new Date()
    });
    
    // Get current user info
    const currentUser = await userService.getUserById(userId);
    
    // Notify the target user via socket
    const io = getIo();
    io.to(`user:${targetUser.UserID}`).emit('friend:request', {
      friendshipId,
      user: {
        id: userId,
        username: currentUser[0].Username,
        profilePicture: currentUser[0].ProfilePicture
      }
    });
    
    res.status(201).json({
      message: 'Friend request sent successfully',
      friendship: {
        id: friendshipId,
        status: 'Pending',
        user: {
          id: targetUser.UserID,
          username: targetUser.Username,
          profilePicture: targetUser.ProfilePicture
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Respond to friend request
exports.respondToFriendRequest = async (req, res, next) => {
  try {
    const { friendshipId } = req.params;
    const { accept } = req.body;
    const userId = req.user.id;
    
    // Check if friendship exists
    const friendships = await friendService.getFriendshipById(friendshipId);
    if (friendships.length === 0) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    const friendship = friendships[0];
    
    // Check if user is the recipient
    if (friendship.UserID2 !== userId) {
      return res.status(403).json({ message: 'You cannot respond to this friend request' });
    }
    
    // Check if friendship is pending
    if (friendship.FriendshipStatus !== 'Pending') {
      return res.status(400).json({ message: 'This friend request has already been processed' });
    }
    
    // Accept marks the friendship; decline removes the request (declining is not blocking)
    const status = accept ? 'Accepted' : 'Declined';
    const updated = accept
      ? await friendService.updateFriendship(friendshipId, {
          FriendshipStatus: status,
          FriendshipDate: new Date()
        })
      : await friendService.deleteFriendship(friendshipId);
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update friend request' });
    }
    
    // Get user info
    const otherUser = await userService.getUserById(friendship.UserID1);
    const currentUser = await userService.getUserById(userId);
    
    // Notify the other user via socket
    const io = getIo();
    io.to(`user:${friendship.UserID1}`).emit('friend:response', {
      friendshipId: Number(friendshipId),
      accepted: Boolean(accept),
      user: {
        id: userId,
        username: currentUser[0].Username
      }
    });
    
    res.status(200).json({
      message: accept ? 'Friend request accepted' : 'Friend request declined',
      friendship: {
        id: Number(friendshipId),
        status,
        user: {
          id: otherUser[0].UserID,
          username: otherUser[0].Username,
          profilePicture: otherUser[0].ProfilePicture
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all friends
exports.getFriends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all friendships
    const friendships = await friendService.getUserFriendships(userId);
    
    // Format response
    const friends = friendships.map(friendship => {
      const otherUserId = friendship.UserID1 === userId ? friendship.UserID2 : friendship.UserID1;
      
      return {
        id: friendship.FriendshipID,
        status: friendship.FriendshipStatus,
        // Pending requests: 'outgoing' if this user sent it, 'incoming' if they received it
        direction: friendship.UserID1 === userId ? 'outgoing' : 'incoming',
        since: friendship.FriendshipDate,
        user: {
          id: otherUserId,
          username: friendship.Username,
          profilePicture: friendship.ProfilePicture,
          onlineStatus: friendship.OnlineStatus
        }
      };
    });
    
    res.status(200).json({ friends });
  } catch (error) {
    next(error);
  }
};

// Remove friend
exports.removeFriend = async (req, res, next) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.id;
    
    // Check if friendship exists
    const friendships = await friendService.getFriendshipById(friendshipId);
    if (friendships.length === 0) {
      return res.status(404).json({ message: 'Friendship not found' });
    }
    
    const friendship = friendships[0];
    
    // Check if user is part of the friendship
    if (friendship.UserID1 !== userId && friendship.UserID2 !== userId) {
      return res.status(403).json({ message: 'You are not part of this friendship' });
    }
    
    // Delete friendship
    const deleted = await friendService.deleteFriendship(friendshipId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to remove friend' });
    }
    
    // Notify the other user via socket
    const otherUserId = friendship.UserID1 === userId ? friendship.UserID2 : friendship.UserID1;
    
    const io = getIo();
    io.to(`user:${otherUserId}`).emit('friend:removed', {
      friendshipId: Number(friendshipId),
      userId
    });
    
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    next(error);
  }
};

// Block user
exports.blockUser = async (req, res, next) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;
    
    // Check if user exists
    const users = await userService.getUserByUsername(username);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const targetUser = users[0];
    
    // Check if trying to block self
    if (targetUser.UserID === userId) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }
    
    // Check if friendship already exists
    const existingFriendship = await friendService.getFriendship(userId, targetUser.UserID);
    
    let friendshipId;
    
    if (existingFriendship.length > 0) {
      const friendship = existingFriendship[0];
      
      // Update existing friendship to blocked
      await friendService.updateFriendship(friendship.FriendshipID, {
        FriendshipStatus: 'Blocked',
        FriendshipDate: new Date()
      });
      
      friendshipId = friendship.FriendshipID;
    } else {
      // Create new blocked friendship
      friendshipId = await friendService.createFriendship({
        userID1: userId,
        userID2: targetUser.UserID,
        friendshipStatus: 'Blocked',
        friendshipDate: new Date()
      });
    }
    
    res.status(200).json({
      message: 'User blocked successfully',
      friendship: {
        id: friendshipId,
        status: 'Blocked',
        user: {
          id: targetUser.UserID,
          username: targetUser.Username
        }
      }
    });
  } catch (error) {
    next(error);
  }
};