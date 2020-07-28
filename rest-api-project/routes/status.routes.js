const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const User = require('../models/User.model');
const statusControllers = require('../controllers/status.controllers');
const isAuth = require('../middleware/is-auth');

router.get('/', isAuth, statusControllers.getStatus);

router.put('/', isAuth, statusControllers.updateStatus);

module.exports = router;
