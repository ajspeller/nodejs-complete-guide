const chalk = require('chalk');

const Product = require('../models/Product.model');
const Order = require('../models/Order.model');

module.exports = {
  getProducts: (req, res, next) => {
    Product.find()
      .then((products) => {
        res.render('shop/product-list', {
          products,
          title: 'All Products',
          path: '/products',
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
        });
      })
      .catch((err) => console.error('getIndex: ', err));
  },
  getCart: (req, res, next) => {
    req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then((user) => {
        const products = user.cart.items;
        res.render('shop/cart', {
          path: '/cart',
          title: 'Your Cart',
          products,
        });
      })
      .catch((err) => console.error(err));
  },
  postCart: (req, res, next) => {
    const { productId: id } = req.body;
    Product.findById(id)
      .then((product) => {
        return req.user.addToCart(product);
      })
      .then((result) => {
        res.redirect('/cart');
      });
  },
  getOrders: (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
      .then((orders) => {
        res.render('shop/orders', {
          path: '/orders',
          title: 'Orders',
          orders,
        });
      })
      .catch((err) => console.error(err));
  },
  postOrder: (req, res, next) => {
    req.user
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
            username: req.user.username,
            userId: req.user,
          },
          products,
        });
        return order.save();
      })
      .then((result) => {
        return req.user.clearCart();
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
        });
      })
      .catch((err) => console.error('db error: ', err));
  },
  postCartDeleteProduct: (req, res, next) => {
    const { productId: id } = req.body;
    req.user
      .removeFromCart(id)
      .then((result) => {
        res.redirect('/cart');
      })
      .catch((err) => console.error(err));
  },
};
