require('dotenv').config();

const path = require('path');

const chalk = require('chalk');
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 4000;

const errorController = require('./controllers/error.controller');
const { mongoConnect } = require('./util/database');

const User = require('./models/User.model');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false, limit: '20mb' }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  User.findById('5f1b7434f91cd84d7893c9ca')
    .then((user) => {
      console.log(user);
      const { username, email, cart, _id } = user;
      req.user = new User(username, email, cart, _id);
      next();
    })
    .catch((err) => console.error(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(PORT, () => console.log(chalk.green('Server started: '), PORT));
});
