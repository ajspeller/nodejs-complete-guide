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
const multer = require('multer');
const PORT = process.env.PORT || 4000;

const PDFDocument = require('pdfkit');

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_DB,
  collection: 'sessions',
});
const csrf = require('csurf');
const csrfProtection = csrf();
const flash = require('connect-flash');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');
const authRoutes = require('./routes/auth.routes');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

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

app.use(multer({ storage: fileStorage, fileFilter }).single('image'));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((err, req, res, next) => {
  res.redirect('/500');
});

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((result) => {
    console.log(chalk.green.inverse('Database connection successful!'));
    app.listen(PORT, () => console.log(chalk.green('Server started: '), PORT));
  })
  .catch((err) => console.error(err));
