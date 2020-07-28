require('dotenv').config();

const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed.routes');
const authRoutes = require('./routes/auth.routes');
const statusRoutes = require('./routes/status.routes');
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  multer({
    storage,
    fileFilter,
  }).single('image')
);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, DELETE, PUT, PATCH, POST, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);
app.use('/status', statusRoutes);

app.use((req, res, next) => {
  // route not found
  res.status(404).json({ error: 'page not found' });
});

app.use((err, req, res, next) => {
  // error handling
  console.log(err);
  const { statusCode, message, data } = err;
  res.status(statusCode || 500).json({ message, data });
});

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then((result) => {
    console.log('Connected to database');
    const server = app.listen(8080, () =>
      console.log('listening on port 8080')
    );
    const io = require('./socket').init(server);
    io.on('connection', (socket) => {
      console.log('socket client connected');
    });
  })
  .catch((err) => console.log('Database connection error: ', err));
