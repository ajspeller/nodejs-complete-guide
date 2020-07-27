const crypto = require('crypto');

const chalk = require('chalk');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/User.model');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_KEY,
    },
  })
);

module.exports = {
  getLogin: (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/login', {
      path: '/login',
      title: 'Login',
      errorMessage: message,
      oldInput: { email: '', password: '' },
      validationErrors: [],
    });
  },
  getSignup: (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/signup', {
      path: '/signup',
      title: 'Signup',
      errorMessage: message,
      oldInput: { email: '', password: '', confirmPassword: '' },
      validationErrors: [],
    });
  },
  postLogin: (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('auth/login', {
        path: '/login',
        title: 'Login',
        errorMessage: {
          msg: errors.array().map((e) => {
            return e.msg;
          }),
        },
        oldInput: { email, password },
        validationErrors: errors.array(),
      });
    }
    User.findOne({ email })
      .then((user) => {
        if (user) {
          const hashedPassword = user.password;
          bcrypt
            .compare(password, hashedPassword)
            .then((passwordMatch) => {
              console.log('comparing', passwordMatch);
              if (passwordMatch) {
                req.session.user = user;
                req.session.isLoggedIn = true;
                console.log(chalk.inverse.blue('Logged In'));
                req.session.save((err) => {
                  if (err) {
                    console.error(err);
                  }
                  res.redirect('/');
                });
              } else {
                req.flash('error', 'Invalid Credentials');
                res.redirect('/login');
              }
            })
            .catch((err) => {
              req.flash('error', 'Invalid Credentials');
              res.redirect('/login');
            });
        } else {
          console.log('user not found');
          req.flash('error', 'Invalid Credentials');
          res.redirect('/login');
        }
      })
      .catch((err) => {
        console.error('database error: ', err);
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  postSignup: (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('auth/signup', {
        path: '/signup',
        title: 'Signup',
        errorMessage: {
          msg: errors.array().map((e) => {
            return e.msg;
          }),
        },
        oldInput: { email, password, confirmPassword },
        validationErrors: errors.array(),
      });
    }
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const newUser = new User({
          email,
          password: hashedPassword,
          cart: { items: [] },
        });
        return newUser.save();
      })
      .then((result) => {
        return transporter.sendMail({
          to: email,
          from: 'shop@node-complete.com',
          subject: 'Signup Successful',
          html: 'Thank for for signing up',
        });
      })
      .then((result) => {
        res.redirect('/login');
      })
      .catch((err) => {
        console.error('database error: ', err);
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  postLogout: (req, res, next) => {
    req.session.destroy((err) => {
      if (err) {
        console.err(err);
      }
      res.redirect('/');
    });
  },
  getReset: (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/reset', {
      path: '/reset',
      title: 'Reset Password',
      errorMessage: message,
    });
  },
  postReset: (req, res, next) => {
    const { email } = req.body;
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.err(err);
        return res.redirect('/reset');
      }
      const token = buffer.toString('hex');
      User.findOne({ email })
        .then((user) => {
          if (!user) {
            req.flash('error', 'No account with that email');
            return res.redirect('/reset');
          }
          const tokenLifeInMinutes = 10;
          user.resetToken = token;
          user.resetTokenExpiration =
            Date.now() + tokenLifeInMinutes * 60 * 1000;
          return user.save();
        })
        .then((result) => {
          res.redirect('/login');
          transporter.sendMail({
            to: email,
            from: 'shop@node-complete.com',
            subject: 'Password Reset',
            html: `
              <p>Your requested a password reset</p>
              <p>This link is only good for 10 minutes</p>
              <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
            `,
          });
        })
        .catch((err) => {
          console.error('database error: ', err);
          // res.redirect('/500');
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    });
  },
  getNewPassword: (req, res, next) => {
    const { token } = req.params;
    User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    })
      .then((user) => {
        console.log(user);
        let message = req.flash('error');
        if (message.length > 0) {
          message = message[0];
        } else {
          message = null;
        }
        res.render('auth/new-password', {
          path: '/new-password',
          title: 'New Password',
          errorMessage: message,
          userId: user._id.toString(),
          token,
        });
      })
      .catch((err) => {
        console.error('database error: ', err);
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  postNewPassword: (req, res, next) => {
    const { userId, password, resetToken } = req.body;
    User.findOne({
      _id: userId,
      resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    })
      .then((user) => {
        bcrypt
          .hash(password, 12)
          .then((hashedPassword) => {
            user.password = hashedPassword;
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            return user.save();
          })
          .then((result) => {
            res.redirect('/login');
          });
      })
      .catch((err) => {
        console.error('database error: ', err);
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
};
