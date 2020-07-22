require('dotenv').config();
require('./database/db');

const path = require('path');

const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 4000;
const expressHbs = require('express-handlebars');

const adminData = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

// app.engine(
//   'handlebars',
//   expressHbs({
//     layoutsDir: 'views/layouts/',
//     defaultLayout: 'main-layout',
//     extname: 'handlebars'
//   })
// );
// app.set('view engine', 'handlebars');

// app.set('view engine', 'pug');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false, limit: '20mb' }));
app.use(bodyParser.json());

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Page not found', path });
});

app.listen(PORT, () => {
  console.log('Server started: ', PORT);
});
