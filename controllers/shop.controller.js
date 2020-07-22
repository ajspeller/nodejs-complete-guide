const Product = require('../models/Product.model');

module.exports = {
  getProducts: (req, res, next) => {
    Product.fetchAll((products) => {
      res.render('shop/product-list', {
        products,
        title: 'All Products',
        path: '/products',
      });
    });
  },
  getIndex: (req, res, next) => {
    Product.fetchAll((products) => {
      res.render('shop/index', {
        products,
        title: 'Shop',
        path: '/',
      });
    });
  },
  getCart: (req, res, next) => {
    res.render('shop/cart', {
      path: '/cart',
      title: 'Your Cart',
    });
  },
  getCheckout: (req, res, next) => {
    res.render('shop/checkout', {
      path: '/checkout',
      title: 'Checkout',
    });
  },
  getOrders: (req, res, next) => {
    res.render('shop/orders', {
      path: '/orders',
      title: 'Orders',
    });
  },
};
