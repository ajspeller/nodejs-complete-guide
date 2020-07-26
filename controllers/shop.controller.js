const chalk = require('chalk');

const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const User = require('../models/User.model');

module.exports = {
  getProducts: (req, res, next) => {
    Product.find()
      .then((products) => {
        res.render('shop/product-list', {
          products,
          title: 'All Products',
          path: '/products',
          isAuthenticated: req.session.isLoggedIn,
        });
      })
      .catch((err) => console.error('getIndex: ', err));
  },
  getIndex: (req, res, next) => {
    Product.find()
      .then((products) => {
        res.render('shop/index', {
          products,
          title: 'Shop',
          path: '/',
          isAuthenticated: req.session.isLoggedIn,
        });
      })
      .catch((err) => console.error('getIndex: ', err));
  },
  getCart: (req, res, next) => {
    User.findById(req.session.user._id)
      .then((user) => {
        return user.populate('cart.items.productId').execPopulate();
      })
      .then((user) => {
        const products = user.cart.items;
        res.render('shop/cart', {
          path: '/cart',
          title: 'Your Cart',
          products,
          isAuthenticated: req.session.isLoggedIn,
        });
      })
      .catch((err) => console.error(err));
  },
  postCart: (req, res, next) => {
    const { productId: id } = req.body;
    let foundProduct;
    Product.findById(id)
      .then((product) => {
        foundProduct = product;
        return User.findById(req.session.user._id);
      })
      .then((user) => {
        return user.addToCart(foundProduct);
      })
      .then((result) => {
        res.redirect('/cart');
      });
  },
  getOrders: (req, res, next) => {
    Order.find({ 'user.userId': req.session.user._id })
      .then((orders) => {
        res.render('shop/orders', {
          path: '/orders',
          title: 'Orders',
          orders,
          isAuthenticated: req.session.isLoggedIn,
        });
      })
      .catch((err) => console.error(err));
  },
  postOrder: (req, res, next) => {
    req.session.user
      .populate('cart.items.productId')
      .execPopulate()
      .then((user) => {
        const products = user.cart.items.map((i) => {
          return {
            quantity: i.quantity,
            product: { ...i.productId._doc },
          };
        });
        const order = new Order({
          user: {
            username: req.session.user.username,
            userId: req.session.user,
          },
          products,
        });
        return order.save();
      })
      .then((result) => {
        return req.session.user.clearCart();
      })
      .then((result) => {
        res.redirect('/orders');
      })
      .catch((err) => console.error(err));
  },
  getCheckout: (req, res, next) => {
    res.render('shop/checkout', {
      path: '/checkout',
      title: 'Checkout',
      isAuthenticated: req.session.isLoggedIn,
    });
  },
  getProduct: (req, res, next) => {
    const { id } = req.params;
    Product.findById(id)
      .then((product) => {
        res.render('shop/product-detail', {
          title: product.title,
          path: '/products',
          product,
          isAuthenticated: req.session.isLoggedIn,
        });
      })
      .catch((err) => console.error('db error: ', err));
  },
  postCartDeleteProduct: (req, res, next) => {
    const { productId: id } = req.body;
    User.findById(req.session.user._id)
      .then((user) => {
        return user.removeFromCart(id);
      })
      .then((result) => {
        res.redirect('/cart');
      })
      .catch((err) => console.error(err));
  },
};
