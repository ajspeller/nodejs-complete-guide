require('dotenv').config();

const jwt = require('jsonwebtoken');

module.exports = isAuth = (req, res, next) => {
  if (!req.get('Authorization')) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }
  const [, token] = req.get('Authorization').split(' ');
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
