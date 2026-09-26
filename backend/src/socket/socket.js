const socketIo = require('socket.io');
const INSTANCE_NAME = require('../config/instance');
const { verifyAccessToken } = require('../utils/tokens');
const userService = require('../services/userService');
const serverService = require('../services/serverService');
const messageHandlers = require('./messageHandlers');

let io;

exports.initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST']
    }
  });
  
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = verifyAccessToken(token);

      const users = await userService.getUserById(decoded.id);
      if (users.length === 0) {
        return next(new Error('User not found'));
      }

      socket.user = {
        id: users[0].UserID,
        username: users[0].Username
      };
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`[${INSTANCE_NAME}] User connected: ${socket.user.username} (${socket.user.id})`);

    userService.updateUser(socket.user.id, { OnlineStatus: 'Online' })
      .then(() => {

        socket.broadcast.emit('user:status', {
          userId: socket.user.id,
          status: 'Online'
        });
      })
      .catch(err => console.error('Error updating user status:', err));

    socket.join(`user:${socket.user.id}`);

    // Which process is serving this socket — the "served-by-pod" badge (PLAN.md Phase 1)
    socket.emit('session:ready', { node: INSTANCE_NAME, pid: process.pid });

    // Server rooms carry space-wide events (e.g. new channels); members only
    socket.on('join:server', async (serverId) => {
      try {
        if (await serverService.isServerMember(serverId, socket.user.id)) {
          socket.join(`server:${serverId}`);
        }
      } catch (err) {
        console.error('Error joining server room:', err);
      }
    });

    // join:channel / leave:channel live in messageHandlers, behind a membership check

    messageHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`[${INSTANCE_NAME}] User disconnected: ${socket.user.username} (${socket.user.id})`);

      userService.updateUser(socket.user.id, { OnlineStatus: 'Offline' })
        .then(() => {

          socket.broadcast.emit('user:status', {
            userId: socket.user.id,
            status: 'Offline'
          });
        })
        .catch(err => console.error('Error updating user status:', err));
    });
  });
  
  return io;
};

exports.getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};