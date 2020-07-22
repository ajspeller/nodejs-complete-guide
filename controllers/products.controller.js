const Product = require('../models/Product.model');

module.exports = {
  getAddProduct: (req, res, next) => {
    res.render('add-product', {
      title: 'Add Product',
      path: '/admin/add-product',
      activeAddProduct: true,
      productCSS: true,
    });
  },
  postAddProduct: (req, res, next) => {
    const { title } = req.body;
    const product = new Product(title);
    product.save();
    res.redirect('/');
  },
  getProducts: (req, res, next) => {
    Product.fetchAll((products) => {
      res.render('shop', {
        products,
        title: 'Shop',
        path: '/',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,
      });
    });
  },
};
