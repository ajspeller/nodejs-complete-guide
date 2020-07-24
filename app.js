require('dotenv').config();
require('./database/db');

const path = require('path');

const sequelize = require('./util/database');

const Product = require('./models/Product.model');
const User = require('./models/User.model');
const Cart = require('./models/Cart.model');
const CartItem = require('./models/CartItem.model');
const Order = require('./models/Order.model');
const OrderItem = require('./models/OrderItem.model');

const chalk = require('chalk');
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

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.error(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    console.log(chalk.yellow('squelize synced'));
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ username: 'AJ', email: 'chillin@home.com' });
    }
    return Promise.resolve(user);
  })
  .then((user) => {
    return user.createCart();
  })
  .then((cart) => {
    console.log(chalk.inverse.yellow('User Created'));
    app.listen(PORT, () => console.log(chalk.green('Server started: '), PORT));
  })
  .catch((err) => console.error('sequelize error: ', err));
