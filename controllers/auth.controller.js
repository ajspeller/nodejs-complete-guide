const chalk = require('chalk');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

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
    });
  },
  postLogin: (req, res, next) => {
    const { email, password } = req.body;
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
        console.error(err);
        res.redirect('/login');
      });
  },
  postSignup: (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    User.findOne({ email: email })
      .then((user) => {
        if (user) {
          req.flash('error', 'E-mail already exists');
          return res.redirect('/signup');
        }
        if (password === confirmPassword) {
          return bcrypt
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
            .catch((err) => console.error(err));
        }
        return res.redirect('/signup');
      })
      .catch((err) => {
        console.error(err);
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
};
