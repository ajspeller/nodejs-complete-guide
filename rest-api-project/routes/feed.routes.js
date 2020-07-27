const express = require('express');
const router = express.Router();

const feedControllers = require('../controllers/feed.controllers');

router.get('/posts', feedControllers.getPosts);
router.get('/posts/:id', feedControllers.getPost);
router.post('/posts', feedControllers.createPost);
router.put('/posts/:id', feedControllers.updatePost);
router.delete('/posts/:id', feedControllers.deletePost);

module.exports = router;
