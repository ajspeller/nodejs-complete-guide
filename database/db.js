require('dotenv').config();

const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database connection successful!'))
  .catch((err) => console.error('Database connection failure!', err));
