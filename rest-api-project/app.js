const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed.routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.use((req, res, next) => {
  // route not found
  res.status(404).json({ error: 'page not found' });
});

app.use((err, req, res, next) => {
  // error handling
  res.status(500).json({ error: 'unknown server error' });
});

app.listen(4500);
