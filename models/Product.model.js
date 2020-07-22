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
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log('Error writing file: ', err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
};
