const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (format is: "Bearer <token_string>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature using JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user from database using decoded ID, but exclude password hash
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to next middleware or route controller
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
