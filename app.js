require('dotenv').config();

const path = require('path');

const chalk = require('chalk');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error.controller');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const PORT = process.env.PORT || 4000;

const User = require('./models/User.model');
const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_DB,
  collection: 'sessions',
});

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');
const authRoutes = require('./routes/auth.routes');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(morgan('dev'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false, limit: '20mb' }));
app.use(bodyParser.json());

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

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
