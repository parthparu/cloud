const { verifyAccessToken } = require('../utils/tokens');
const userService = require('../services/userService');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Check if user exists
    const users = await userService.getUserById(decoded.id);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Set user in request
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    next(error);
  }
};