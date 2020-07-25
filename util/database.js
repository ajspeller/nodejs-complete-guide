require('dotenv').config();

const mongodb = require('mongodb');
const { MongoClient } = mongodb;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(process.env.MONGO_DB, { useUnifiedTopology: true })
    .then((client) => {
      console.log('Connected to database!');
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found';
};

module.exports = { mongoConnect, getDb };
