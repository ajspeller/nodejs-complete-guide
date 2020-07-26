const express = require('express');
const router = express.Router();
const { check, body, validationResult } = require('express-validator');

const adminController = require('../controllers/admin.controller');
const isAuth = require('../middleware/is-auth');

router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.post(
  '/add-product',
  isAuth,
  // [
  //   check('title')
  //     .trim()
  //     .isString()
  //     .withMessage('Please enter a title<br>'),
  //   check('imageUrl')
  //     .trim()
  //     .isURL()
  //     .withMessage('Please enter a valid image url<br>'),
  //   check('price').isFloat().withMessage('Please enter a valid price<br>'),
  //   check('description')
  //     .trim()
  //     .withMessage('Please enter a valid description<br>'),
  // ],
  adminController.postAddProduct
);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post(
  '/edit-product',
  isAuth,
  // [
  //   check('title')
  //     .trim()
  //     .isAlphanumeric()
  //     .withMessage('Please enter a title<br>'),
  //   check('imageUrl')
  //     .trim()
  //     .isURL()
  //     .withMessage('Please enter a valid image url<br>'),
  //   check('price').isFloat().withMessage('Please enter a valid price<br>'),
  //   check('description')
  //     .trim()
  //     .withMessage('Please enter a valid description<br>'),
  // ],
  adminController.postEditProduct
);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
