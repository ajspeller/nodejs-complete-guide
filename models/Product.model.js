const mongodb = require('mongodb');
const { ObjectId } = mongodb;
const { getDb } = require('../util/database');

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new ObjectId(id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      // update
      dbOp = db
        .collection('products')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      // insert
      dbOp = db.collection('products').insertOne(this);
    }
    return dbOp
      .then((result) => {
        console.log('result: ', result);
      })
      .catch((err) => console.err(err));
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection('products')
      .find()
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => console.err(err));
  }

  static findById(id) {
    const db = getDb();
    return db
      .collection('products')
      .find({ _id: new ObjectId(id) })
      .next()
      .then((product) => {
        return product;
      })
      .catch((err) => console.error(err));
  }

  static deleteById(id) {
    const db = getDb();
    return db
      .collection('products')
      .deleteOne({ _id: new ObjectId(id) })
      .then((product) => {
        console.log('Deleted', product);
      })
      .catch((err) => console.error(err));
  }
}

module.exports = Product;
