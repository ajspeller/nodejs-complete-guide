// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const cartSchema = new Schema({
//   : {
//     type: String,
//     required: true,
//   },
//   : {
//     type: Number,
//     required: true,
//   },
//   : {
//     type: String,
//     required: true,
//   },
// });

// module.exports = mongoose.model('Cart', cartSchema);

const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');

const p = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // fetch previous cart
    fs.readFile(p, (err, fileContents) => {
      let cart = {
        products: [],
        totalPrice: 0,
      };
      if (err) {
        console.error('Error reading file: ', err);
      }
      if (!err) {
        cart = JSON.parse(fileContents);
      }
      // look for existing product
      const existingProductIndex = cart.products.findIndex(
        (product) => product.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      // add new product and increase quantity
      if (existingProduct) {
        // replace product
        updatedProduct = { ...existingProduct };
        updatedProduct.qty += 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        // add product
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice += +productPrice;
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.error('Error writing file: ', err);
      });
    });
  }

  static deleteProduct(id) {
    fs.readFile(p, (err, fileContents) => {
      if (err) {
        return;
      }
      const cart = JSON.parse(fileContents);
      const updatedCart = { ...cart };
      const product = updatedCart.products.find((p) => p.id === id);
      if (!product) {
        return;
      }
      const { qty, price } = product;
      updatedCart.products = updatedCart.products.filter((p) => p.id !== id);
      updatedCart.totalPrice -= price * qty;
      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.error('Error writing file: ', err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContents) => {
      const cart = JSON.parse(fileContents);
      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
