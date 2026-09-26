// Load .env before anything reads process.env (the database driver is chosen at require time)
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { initializeSocket } = require('./src/socket/socket');
const realtimeAdapter = require('./src/socket/adapter');
const errorHandler = require('./src/middleware/errorHandler');
const db = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const serverRoutes = require('./src/routes/serverRoutes');
const channelRoutes = require('./src/routes/channelRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const friendRoutes = require('./src/routes/friendRoutes');
const invitationRoutes = require('./src/routes/invitationRoutes');

const app = express();
const server = http.createServer(app);

const io = initializeSocket(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/invitations', invitationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Accept traffic only once the database is ready and copies can share real-time events
Promise.all([db.ready, realtimeAdapter.setup(io)])
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[startup] could not start:', err.message);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});