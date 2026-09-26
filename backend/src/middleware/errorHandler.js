const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    
    if (err.message === 'Invalid file type') {
      return res.status(400).json({
        message: 'Invalid file type. Only images, videos, and documents are allowed.'
      });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired'
      });
    }
    
    // Default error
    res.status(500).json({
      message: err.message || 'Something went wrong'
    });
  };
  
  module.exports = errorHandler;