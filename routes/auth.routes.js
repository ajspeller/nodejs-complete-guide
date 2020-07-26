const express = require('express');
const router = express.Router();
const { check, body, validationResult } = require('express-validator');

const authController = require('../controllers/auth.controller');
const isAuth = require('../middleware/is-auth');

const User = require('../models/User.model');

router.get('/login', authController.getLogin);
router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email<br>')
      .normalizeEmail(),
    // check('password')
    //   .not()
    //   .exists()
    //   .trim()
    //   .withMessage('Please enter a valid password<br>'),
  ],
  authController.postLogin
);
router.post('/logout', isAuth, authController.postLogout);
router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address is forbidden');
        // }
        // return true;
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject('Email exists already');
          }
        });
      }),
    body('password', 'Password must be alphanumberic and at least 5 characters')
      .isLength({ min: 5 })
      .trim()
      .isAlphanumeric(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        console.log(value);
        console.log(req.body.password);
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      }),
  ],
  authController.postSignup
);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
