const path = require('path');
const express = require('express');
const router = express.Router();
const rootDir = require('../util/path');

const adminData = require('./admin.routes');

router.get('/', (req, res, next) => {
  const { products } = adminData;
  const hasProducts = products.length > 0;
  res.render('shop', {
    products,
    title: 'Shop',
    path: '/',
    hasProducts,
    activeShop: true,
    productCSS: true,
  });
});

module.exports = router;
