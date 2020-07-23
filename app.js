require('dotenv').config();
require('./database/db');
require('./util/database');

const path = require('path');

const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 4000;

const errorController = require('./controllers/error.controller');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false, limit: '20mb' }));
app.use(bodyParser.json());

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(PORT, () => {
  console.log('Server started: ', PORT);
});
