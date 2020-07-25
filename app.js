require('dotenv').config();

const path = require('path');

const chalk = require('chalk');
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 4000;

const errorController = require('./controllers/error.controller');
const mongoose = require('mongoose');

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
  User.findById('5f1c8ffb690d20063816f8bb')
    .then((user) => {
      console.log(user);
      req.user = user;
      next();
    })
    .catch((err) => console.error(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        new User({
          username: 'ajspeller',
          email: 'ajischillin@home.com',
          cart: {
            items: [],
          },
        }).save();
      }
    });
    console.log(chalk.green.inverse('Database connection successful!'));
    app.listen(PORT, () => console.log(chalk.green('Server started: '), PORT));
  })
  .catch((err) => console.error(err));
