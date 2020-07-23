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
    product.save();
    res.redirect('/');
  },
  getEditProduct: (req, res, next) => {
    const { edit: editMode } = req.query;
    const { productId } = req.params;
    if (!editMode) {
      return res.redirect('/');
    }
    Product.findById(productId, (product) => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        title: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product,
      });
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
    updatedProduct.save();
    res.redirect('/admin/products');
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
  postDeleteProduct: (req, res, next) => {
    const { productId } = req.body;
    Product.deleteById(productId);
    res.redirect('/admin/products');
  },
};
