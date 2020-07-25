const chalk = require('chalk');

const Product = require('../models/Product.model');

module.exports = {
  getProducts: (req, res, next) => {
    Product.fetchAll()
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
    Product.fetchAll()
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
      .getCart()
      .then((products) => {
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
    req.user
      .getOrders()
      .then((orders) => {
        res.render('shop/orders', {
          path: '/orders',
          title: 'Orders',
          orders,
        });
      })
      .catch((err) => console.error(err));
  },
  postCreateOrder: (req, res, next) => {
    req.user
      .addOrder()
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
      .deleteItemFromCart(id)
      .then((result) => {
        res.redirect('/cart');
      })
      .catch((err) => console.error(err));
  },
};
