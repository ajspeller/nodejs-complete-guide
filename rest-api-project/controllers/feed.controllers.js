const { validationResult } = require('express-validator');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const fs = require('fs');
const path = require('path');
const io = require('../socket');

module.exports = {
  getPosts: async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 10;

    try {
      const totalItems = await Post.find().countDocuments();
      const posts = await Post.find()
        .populate('creator')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);

      if (!posts) {
        const error = new Error('Error retrieving posts');
        error.statusCode = 500;
        throw error;
      }
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts,
        totalItems,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  getPost: (req, res, next) => {
    const { id } = req.params;
    try {
      const post = Post.findById(id);
      if (!post) {
        const error = new Error('The specified id does not exist');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post fetched', post });
    } catch (error) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  createPost: async (req, res, next) => {
    const { title, content } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, data entered is incorrect');
      error.statusCode = 422;
      throw error;
    }
    if (!req.file) {
      const error = new Error('No image provided');
      error.statusCode = 422;
      throw error;
    }
    const post = new Post({
      title,
      content,
      imageUrl: req.file.path.replace('\\', '/'),
      creator: req.userId,
    });
    try {
      await post.save();
      const user = await User.findById(req.userId);
      user.posts.push(post);
      await user.save();
      io.getIO().emit('posts', {
        action: 'create',
        post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
      });
      res.status(201).json({
        message: 'post created',
        post,
        creator: {
          _id: user._id,
          name: user.name,
        },
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  deletePost: async (req, res, next) => {
    const { id } = req.params;
    try {
      const post = await Post.findById(id);
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Unauthorized action');
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      await Post.findByIdAndRemove(id);
      const user = User.findById(req.userId);
      user.post.pull(postId);
      await user.save();
      io.getIO().emit('posts', { action: 'delete', post: id });
      res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  updatePost: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, data entered is incorrect');
      error.statusCode = 422;
      throw error;
    }
    const { id } = req.params;
    const { title, content } = req.body;
    let { image: imageUrl } = req.body;
    if (req.file) {
      imageUrl = req.file.path;
    }
    if (!imageUrl) {
      const error = new Error('No file was selected');
      error.statusCode = 422;
      throw error;
    }
    try {
      const post = await Post.findById(id).populate('creator');
      if (!post) {
        const error = new Error('Error fetching post');
        error.statusCode = 404;
        throw error;
      }
      console.log(post.creator._id);
      console.log(req.userId);
      if (post.creator._id.toString() !== req.userId) {
        const error = new Error('Unauthorized action');
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl.replace('\\', '/');
      const result = await post.save();
      io.getIO().emit('posts', { action: 'update', post: result });
      res.status(200).json({ message: 'Update Successful', post: result });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
