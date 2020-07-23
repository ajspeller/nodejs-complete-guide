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
    const product = new Product(null, title, imageUrl, description, price);
    product
      .save()
      .then(([product]) => {
        res.redirect('/');
      })
      .catch((err) => console.log('error saving: ', err));
  },
  getEditProduct: (req, res, next) => {
    const { edit: editMode } = req.query;
    const { productId } = req.params;
    if (!editMode) {
      return res.redirect('/');
    }
    Product.findById(productId)
      .then(([product]) => {
        if (!product[0]) {
          return res.redirect('/');
        }
        res.render('admin/edit-product', {
          title: 'Edit Product',
          path: '/admin/edit-product',
          editing: editMode,
          product: product[0],
        });
      })
      .catch((err) => {
        console.error('database error: ', err);
      });
  },
  postEditProduct: (req, res, next) => {
    console.log(req.body);
    const { productId, title, price, imageUrl, description } = req.body;
    const updatedProduct = new Product(
      productId,
      title,
      imageUrl,
      description,
      price
    );
    updatedProduct
      .save()
      .then(([product]) => {
        res.redirect('/admin/products');
      })
      .catch((err) => console.log('error saving: ', err));
  },
  getProducts: (req, res, next) => {
    Product.fetchAll()
      .then(([products, fieldData]) => {
        res.render('admin/products', {
          products,
          title: 'Admin Products',
          path: '/admin/products',
        });
      })
      .catch((err) => console.error('db error: ', error));
  },
  postDeleteProduct: (req, res, next) => {
    const { productId } = req.body;
    Product.deleteById(productId);
    res.redirect('/admin/products');
  },
};
