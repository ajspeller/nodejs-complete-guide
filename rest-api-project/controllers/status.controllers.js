const User = require('../models/User.model');

module.exports = {
  getStatus: async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        const error = new Error('User does not exist');
        error.statusCode = 422;
        throw error;
      }
      res.status(200).json({ message: 'user found', status: user.status });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  updateStatus: async (req, res, next) => {
    const { status } = req.body;
    try {
      const user = User.findById(req.userId);
      if (!user) {
        const error = new Error('User does not exist');
        error.statusCode = 422;
        throw error;
      }
      user.status = status;
      const result = await user.save();
      res.status(200).json({ message: 'status updated', result });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
};
