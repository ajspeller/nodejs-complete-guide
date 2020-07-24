const chalk = require('chalk');
const Product = require('../models/Product.model');

module.exports = {
  getAddProduct: (req, res, next) => {
    res.render('admin/edit-product', {
      title: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: new Product(),
    });
  },
  postAddProduct: (req, res, next) => {
    const { title, imageUrl, description, price } = req.body;
    req.user
      .createProduct({ title, imageUrl, description, price })
      .then((result) => {
        console.log(chalk.inverse.blue('Created Product'));
        res.redirect('/admin/products');
      })
      .catch((err) => console.error(err));
  },
  getEditProduct: (req, res, next) => {
    const { edit: editMode } = req.query;
    const { productId: id } = req.params;
    if (!editMode) {
      return res.redirect('/');
    }
    req.user
      .getProducts({ where: { id } })
      .then((products) => {
        const product = products[0];
        if (!product) {
          return res.redirect('/');
        }
        res.render('admin/edit-product', {
          title: 'Edit Product',
          path: '/admin/edit-product',
          editing: editMode,
          product,
        });
      })
      .catch((err) => {
        console.error('database error: ', err);
      });
  },
  postEditProduct: (req, res, next) => {
    const { productId: id, title, price, imageUrl, description } = req.body;
    Product.findByPk(id)
      .then((product) => {
        product.Id = id;
        product.title = title;
        product.price = price;
        product.description = description;
        product.imageUrl = imageUrl;
        return product.save();
      })
      .then(() => {
        console.log(chalk.inverse('Updated Product'));
        res.redirect('/admin/products');
      })
      .catch((err) => console.error('error saving: ', err));
  },
  getProducts: (req, res, next) => {
    req.user
      .getProducts()
      .then((products) => {
        res.render('admin/products', {
          products,
          title: 'Admin Products',
          path: '/admin/products',
        });
      })
      .catch((err) => console.error('db error: ', error));
  },
  postDeleteProduct: (req, res, next) => {
    const { productId: id } = req.body;
    Product.destroy({ where: { id } })
      .then(() => {
        console.log(chalk.inverse.red('Product deleted'));
        res.redirect('/admin/products');
      })
      .catch((err) => console.error(err));
  },
};
