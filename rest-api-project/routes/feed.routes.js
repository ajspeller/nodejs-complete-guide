const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const feedControllers = require('../controllers/feed.controllers');
const isAuth = require('../middleware/is-auth');

router.get('/posts', isAuth, feedControllers.getPosts);
router.get('/posts/:id', isAuth, feedControllers.getPost);
router.post(
  '/posts',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ],
  feedControllers.createPost
);
router.put(
  '/posts/:id',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ],
  feedControllers.updatePost
);
router.delete('/posts/:id', isAuth, feedControllers.deletePost);

module.exports = router;
