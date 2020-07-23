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

const db = require('../util/database');

const Cart = require('../models/Cart.model');

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    return db.execute(
      'insert into products (title, price, imageUrl, description) values (?, ?, ?, ?)',
      [this.title, this.price, this.imageUrl, this.description]
    );
  }

  static deleteById(id, cb) {}

  static fetchAll() {
    return db.execute('select * from products');
  }

  static findById(id, cb) {
    return db.execute('select * from products where products.id = ?', [id]);
  }
};
