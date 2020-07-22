const Product = require('../models/Product.model');

module.exports = {
  getAddProduct: (req, res, next) => {
    res.render('admin/add-product', {
      title: 'Add Product',
      path: '/admin/add-product',
      activeAddProduct: true,
      productCSS: true,
    });
  },
  postAddProduct: (req, res, next) => {
    const { title, imageUrl, description, price } = req.body;
    const product = new Product(title, imageUrl, description, price);
    product.save();
    res.redirect('/');
  },
  getProducts: (req, res, next) => {
    Product.fetchAll((products) => {
      res.render('admin/products', {
        products,
        title: 'Admin Products',
        path: '/admin/products',
      });
    });
  },
  editProduct: (req, res, next) => {
    res.render('/admin/edit-product', {
      product,
    });
  },
};
