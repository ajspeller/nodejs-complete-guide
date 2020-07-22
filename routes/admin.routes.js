const path = require('path');
const express = require('express');
const router = express.Router();
const rootDir = require('../util/path');

const products = [];

router.get('/add-product', (req, res, next) => {
  res.render('add-product', {
    title: 'Add Product',
    path: '/admin/add-product',
    activeAddProduct: true,
    productCSS: true,
  });
});

router.post('/add-product', (req, res, next) => {
  const { title } = req.body;
  console.log(req.body);
  products.push({ title });
  res.redirect('/');
});

exports.routes = router;
exports.products = products;
