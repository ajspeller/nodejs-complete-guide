require('dotenv').config();

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const Post = require('../models/Post.model');
const User = require('../models/User.model');

module.exports = {
  signup: (req, res, next) => {
    const { email, name, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
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
        return user.save();
      })
      .then((user) => {
        res.status(201).json({ message: 'user created', userId: user._id });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  },
  login: (req, res, next) => {
    const { email, password } = req.body;
    let loadedUser;
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          const error = new Error('A user with this email could not be found');
          error.statusCode = 401;
          throw error;
        }
        loadedUser = user;
        const { password: hashedPassword } = user;
        return bcrypt.compare(password, hashedPassword);
      })
      .then((isMatching) => {
        if (!isMatching) {
          const error = new Error('Invalid credentials');
          error.statusCode = 401;
          throw error;
        }
        const token = jwt.sign(
          {
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
          },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        res.status(200).json({ token, userId: loadedUser._id.toString() });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  },
};
