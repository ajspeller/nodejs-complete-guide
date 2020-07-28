require('dotenv').config();

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const User = require('../models/User.model');

module.exports = {
  signup: async (req, res, next) => {
    const { email, name, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      if (!hashedPassword) {
        const error = new Error('User creation failed');
        error.statusCode = 500;
        throw error;
      }
      const user = new User({
        email,
        name,
        password: hashedPassword,
      });
      const savedUser = await user.save();
      res.status(201).json({ message: 'user created', userId: savedUser._id });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  login: async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error('A user with this email could not be found');
        error.statusCode = 401;
        throw error;
      }
      const { password: hashedPassword } = user;
      const isMatching = bcrypt.compare(password, hashedPassword);
      if (!isMatching) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.status(200).json({ token, userId: user._id.toString() });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
};
