const chalk = require('chalk');
const User = require('../models/User.model');

module.exports = {
  getLogin: (req, res, next) => {
    res.render('auth/login', {
      path: '/login',
      title: 'Login',
      product: [],
      isAuthenticated: req.session.isLoggedIn,
    });
  },
  postLogin: (req, res, next) => {
    User.findById('5f1c8ffb690d20063816f8bb')
      .then((user) => {
        console.log(chalk.inverse.blue('Logged In'));
        req.session.user = user;
        req.session.isLoggedIn = true;
        return req.session.save();
      })
      .then(() => {
        res.redirect('/');
      })
      .catch((err) => console.error(err));
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
