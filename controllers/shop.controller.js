const Product = require('../models/Product.model');
const Cart = require('../models/Cart.model');

module.exports = {
  getProducts: (req, res, next) => {
    Product.fetchAll()
      .then(([products, fieldData]) => {
        res.render('shop/product-list', {
          products,
          title: 'All Products',
          path: '/products',
        });
      })
      .catch((err) => console.error('db error: ', error));
  },
  getIndex: (req, res, next) => {
    Product.fetchAll()
      .then(([products, fieldData]) => {
        res.render('shop/index', {
          products,
          title: 'Shop',
          path: '/',
        });
      })
      .catch((err) => console.error('db error: ', error));
  },
  getCart: (req, res, next) => {
    Cart.getCart((cart) => {
      Product.fetchAll()
        .then(([products, fieldData]) => {
          cartProducts = [];
          for (product of products) {
            const cartProductData = cart.products.find(
              (p) => p.id === product.id
            );
            if (cartProductData) {
              cartProducts.push({
                productData: product,
                qty: cartProductData.qty,
              });
            }
          }
          res.render('shop/cart', {
            path: '/cart',
            title: 'Your Cart',
            products: cartProducts,
          });
        })
        .catch((err) => console.error('db error: ', error));
    });
  },
  postCart: (req, res, next) => {
    const { productId: id } = req.body;
    Product.findById(id)
      .then(([product]) => {
        Cart.addProduct(id, product[0].price);
        res.redirect('/cart');
      })
      .catch((err) => console.error('db error: ', err));
  },
  getCheckout: (req, res, next) => {
    res.render('shop/checkout', {
      path: '/checkout',
      title: 'Checkout',
    });
  },
  getOrders: (req, res, next) => {
    res.render('shop/orders', {
      path: '/orders',
      title: 'Orders',
    });
  },
  getProduct: (req, res, next) => {
    const { id } = req.params;
    Product.findById(id)
      .then(([product]) => {
        res.render('shop/product-detail', {
          title: product.title,
          path: '/products',
          product: product[0],
        });
      })
      .catch((err) => console.error('db error: ', err));
  },
  postCartDeleteProduct: (req, res, next) => {
    const { productId } = req.body;
    Cart.deleteProduct(productId);
    res.redirect('/cart');
  },
};
