const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const User = require('../models/User.model');
const authContollers = require('../controllers/auth.controllers');

router.put(
  '/signup',
  [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject('Email address already exists');
          }
        });
      }),
    body('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Please enter a valid name'),
    body('name').trim().not().isEmpty(),
  ],
  authContollers.signup
);

router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .not()
      .isEmpty()
      .withMessage('Please enter an email'),
    body('password')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Please enter an email'),
  ],
  authContollers.login
);

module.exports = router;
