require('dotenv').config();

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const Post = require('../models/Post.model');
const User = require('../models/User.model');

module.exports = {
  getStatus: (req, res, next) => {
    User.findById(req.userId)
      .then((user) => {
        if (!user) {
          const error = new Error('User does not exist');
          error.statusCode = 422;
          throw error;
        }
        res.status(200).json({ message: 'user found', status: user.status });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
          next(err);
        }
      });
  },
  updateStatus: (req, res, next) => {
    const { status } = req.body;
    console.log(status);
    User.findById(req.userId)
      .then((user) => {
        if (!user) {
          const error = new Error('User does not exist');
          error.statusCode = 422;
          throw error;
        }
        user.status = status;
        return user.save();
      })
      .then((result) => {
        res.status(200).json({ message: 'status updated', result });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
          next(err);
        }
      });
  },
};
