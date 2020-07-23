// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const productSchema = new Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   price: {
//     type: Number,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
// });

// module.exports = mongoose.model('Product', productSchema);

const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');

const Cart = require('../models/Cart.model');
const p = path.join(rootDir, 'data', 'products.json');

const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContents) => {
    if (err) {
      return cb([]);
    }
    cb(JSON.parse(fileContents));
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        this.saveExistingProduct(products);
      } else {
        this.saveNewProduct(products);
      }
    });
  }

  saveNewProduct(products) {
    this.id = Math.random().toString();
    products.push(this);
    fs.writeFile(p, JSON.stringify(products), (err) => {
      console.log('Error writing file: ', err);
    });
  }

  saveExistingProduct(products) {
    const existingProductIndex = products.findIndex((p) => p.id === this.id);
    const updatedProducts = [...products];
    updatedProducts[existingProductIndex] = this;
    fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
      console.log('Error writing file: ', err);
    });
  }

  static deleteById(id, cb) {
    getProductsFromFile((products) => {
      const filteredProducts = products.filter((p) => p.id !== id);
      fs.writeFile(p, JSON.stringify(filteredProducts), (err) => {
        console.log('Error writing file: ', err);
        if (!err) {
          Cart.deleteProduct(id);
        }
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.filter((p) => p.id === id)[0];
      cb(product);
    });
  }
};
