require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DB, // database name
  process.env.MYSQL_UN,
  process.env.MYSQL_PW,
  {
    dialect: process.env.DB_DIALECT, // mysql
    host: process.env.DB_HOST, // localhost
  }
);

module.exports = sequelize;
