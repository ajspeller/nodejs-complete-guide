const chalk = require('chalk');
const Product = require('../models/Product.model');

const { validationResult } = require('express-validator');

module.exports = {
  getAddProduct: (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('admin/edit-product', {
      title: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: new Product(),
      errorMessage: message,
      oldInput: { title: '', imageUrl: '', description: '', price: '' },
      validationErrors: [],
    });
  },
  postAddProduct: (req, res, next) => {
    const { title, description, price } = req.body;
    const { file: image } = req;
    if (!image) {
      return res.status(422).render('admin/edit-product', {
        title: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        product: new Product(),
        errorMessage: 'Attached file is not an image',
        oldInput: { title, imageUrl, description, price },
        validationErrors: [],
      });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('admin/edit-product', {
        title: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        product: new Product(),
        errorMessage: {
          msg: errors.array().map((e) => {
            return e.msg;
          }),
        },
        oldInput: { title, imageUrl, description, price },
        validationErrors: errors.array(),
      });
    }
    const product = new Product({
      title,
      price,
      description,
      imageUrl: image.path,
      userId: req.session.user,
    });
    product
      .save()
      .then((result) => {
        console.log(chalk.inverse.blue('Created Product'));
        res.redirect('/admin/products');
      })
      .catch((err) => {
        console.error('database error: ', err);
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  getEditProduct: (req, res, next) => {
    const { edit: editMode } = req.query;
    const { productId: id } = req.params;
    if (!editMode) {
      return res.redirect('/');
    }
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    Product.findById(id)
      .then((product) => {
        if (!product) {
          return res.redirect('/');
        }
        res.render('admin/edit-product', {
          title: 'Edit Product',
          path: '/admin/edit-product',
          editing: editMode,
          product,
          errorMessage: message,
          oldInput: { title: '', imageUrl: '', description: '', price: '' },
          validationErrors: [],
        });
      })
      .catch((err) => {
        console.error('database error: ', err);
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  postEditProduct: (req, res, next) => {
    const { productId: id, title, price, description } = req.body;
    const { file: image } = req;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      Product.findById(id)
        .then((product) => {
          if (!product) {
            return res.redirect('/');
          }
          return res.status(422).render('admin/edit-product', {
            title: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product,
            errorMessage: {
              msg: errors.array().map((e) => {
                return e.msg;
              }),
            },
            oldInput: { id, title, price, imageUrl, description },
            validationErrors: errors.array(),
          });
        })
        .catch((err) => {
          console.error('database error: ', err);
          // res.redirect('/500');
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    }
    Product.findById(id)
      .then((product) => {
        if (product.userId.toString() !== req.session.user._id.toString()) {
          return res.redirect('/');
        }
        product.title = title;
        product.price = price;
        if (image) {
          product.imageUrl = image.path;
        }
        product.description = description;
        product._id = id;
        return product.save().then(() => {
          console.log(chalk.inverse('Updated Product'));
          res.redirect('/admin/products');
        });
      })
      .catch((err) => {
        console.error('database error: ', err);
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  getProducts: (req, res, next) => {
    Product.find({ userId: req.session.user._id })
      // .select('name')
      // .populate('userId')
      .then((products) => {
        console.log(products);
        res.render('admin/products', {
          products,
          title: 'Admin Products',
          path: '/admin/products',
        });
      })
      .catch((err) => {
        console.error('database error: ', err);
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
  postDeleteProduct: (req, res, next) => {
    const { productId: id } = req.body;
    Product.deleteOne({ _id: id, userId: req.session.user._id })
      .then(() => {
        console.log(chalk.inverse.red('Product deleted'));
        res.redirect('/admin/products');
      })
      .catch((err) => {
        console.error('database error: ', err);
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  },
};
