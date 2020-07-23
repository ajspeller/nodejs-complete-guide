const Product = require('../models/Product.model');
const Cart = require('../models/Cart.model');

module.exports = {
  getProducts: (req, res, next) => {
    Product.fetchAll((products) => {
      res.render('shop/product-list', {
        products,
        title: 'All Products',
        path: '/products',
      });
    });
  },
  getIndex: (req, res, next) => {
    Product.fetchAll((products) => {
      res.render('shop/index', {
        products,
        title: 'Shop',
        path: '/',
      });
    });
  },
  getCart: (req, res, next) => {
    Cart.getCart((cart) => {
      Product.fetchAll((products) => {
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
      });
    });
  },
  postCart: (req, res, next) => {
    const { productId: id } = req.body;
    Product.findById(id, (product) => {
      Cart.addProduct(id, product.price);
      // res.render('shop/cart', {
      //   title: '',
      //   path: 'shop/cart',
      //   product,
      // });
      res.redirect('/cart');
    });
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
    Product.findById(id, (product) => {
      res.render('shop/product-detail', {
        title: product.title,
        path: '/products',
        product,
      });
    });
  },
  postCartDeleteProduct: (req, res, next) => {
    const { productId } = req.body;
    Cart.deleteProduct(productId);
    res.redirect('/cart');
  },
};
