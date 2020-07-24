const chalk = require('chalk');

const Product = require('../models/Product.model');

module.exports = {
  getProducts: (req, res, next) => {
    Product.findAll()
      .then((products) => {
        res.render('shop/product-list', {
          products,
          title: 'All Products',
          path: '/products',
        });
      })
      .catch((err) => console.error('getIndex: ', err));
  },
  getIndex: (req, res, next) => {
    Product.findAll()
      .then((products) => {
        res.render('shop/index', {
          products,
          title: 'Shop',
          path: '/',
        });
      })
      .catch((err) => console.error('getIndex: ', err));
  },
  getCart: (req, res, next) => {
    req.user
      .getCart()
      .then((cart) => {
        return cart.getProducts();
      })
      .then((products) => {
        res.render('shop/cart', {
          path: '/cart',
          title: 'Your Cart',
          products,
        });
      })
      .catch((err) => console.error(err));
  },
  postCart: (req, res, next) => {
    const { productId: id } = req.body;
    let fetchedCart;
    let newQuantity = 1;
    req.user
      .getCart()
      .then((cart) => {
        fetchedCart = cart;
        return cart.getProducts({ where: { id } });
      })
      .then((products) => {
        let product;
        if (products.length) {
          product = products[0];
        }
        if (product) {
          const oldQuantity = product.cartItem.quantity;
          newQuantity = oldQuantity + 1;
          return product;
        }
        return Product.findByPk(id);
      })
      .then((product) => {
        return fetchedCart.addProduct(product, {
          through: { quantity: newQuantity },
        });
      })
      .then(() => {
        res.redirect('/cart');
      })
      .catch((err) => console.error(err));
  },

  getOrders: (req, res, next) => {
    req.user
      .getOrders({ include: ['products'] })
      .then((orders) => {
        res.render('shop/orders', {
          path: '/orders',
          title: 'Orders',
          orders,
        });
      })
      .catch((err) => console.error(err));
  },
  postCreateOrder: (req, res, next) => {
    let fetchedCart;
    req.user
      .getCart()
      .then((cart) => {
        fetchedCart = cart;
        return cart.getProducts();
      })
      .then((products) => {
        return req.user
          .createOrder()
          .then((order) => {
            return order.addProducts(
              products.map((p) => {
                p.orderItem = { quantity: p.cartItem.quantity };
                return p;
              })
            );
          })
          .catch((err) => console.error(err));
      })
      .then((result) => {
        return fetchedCart.setProducts(null); // clear out the cart
      })
      .then((result) => {
        res.redirect('/orders');
      })
      .catch((err) => console.error(err));
  },
  getCheckout: (req, res, next) => {
    res.render('shop/checkout', {
      path: '/checkout',
      title: 'Checkout',
    });
  },
  getProduct: (req, res, next) => {
    const { id } = req.params;
    Product.findByPk(id)
      .then((product) => {
        res.render('shop/product-detail', {
          title: product.title,
          path: '/products',
          product,
        });
      })
      .catch((err) => console.error('db error: ', err));
  },
  postCartDeleteProduct: (req, res, next) => {
    const { productId: id } = req.body;
    req.user
      .getCart()
      .then((cart) => {
        return cart.getProducts({
          where: {
            id,
          },
        });
      })
      .then((products) => {
        if (products.length) {
          const product = products[0];
          return product.cartItem.destroy();
        }
        return Promise.resolve(null);
      })
      .then((result) => {
        console.log(result);
        res.redirect('/cart');
      })
      .catch((err) => console.error(err));
  },
};
