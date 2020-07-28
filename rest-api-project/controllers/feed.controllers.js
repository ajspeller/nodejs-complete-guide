const { validationResult } = require('express-validator');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const fs = require('fs');
const path = require('path');

module.exports = {
  getPosts: (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Post.find()
      .countDocuments()
      .then((count) => {
        totalItems = count;
        return Post.find()
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
      })
      .then((posts) => {
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
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
          next(err);
        }
      });
  },
  getPost: (req, res, next) => {
    const { id } = req.params;
    Post.findById(id)
      .then((post) => {
        if (!post) {
          const error = new Error('The specified id does not exist');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'Post fetched', post });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
          next(err);
        }
      });
  },
  createPost: (req, res, next) => {
    const { title, content } = req.body;
    const errors = validationResult(req);
    let creator;
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
    post
      .save()
      .then((post) => {
        return User.findById(req.userId);
      })
      .then((user) => {
        creator = user;
        user.posts.push(post);
        return user.save();
      })
      .then((result) => {
        res.status(201).json({
          message: 'post created',
          post,
          creator: {
            _id: creator._id,
            name: creator.name,
          },
        });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
          next(err);
        }
      });
  },
  deletePost: (req, res, next) => {
    const { id } = req.params;
    Post.findById(id)
      .then((post) => {
        console.log(post);
        if (!post) {
          const error = new Error('Could not find post');
          error.statusCode = 404;
          throw error;
        }
        if (post.creator.toString() !== req.userId) {
          const errors = new Error('Unauthorized action');
          errors.statusCode = 403;
          throw error;
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(id);
      })
      .then((result) => {
        return User.findById(req.userId);
      })
      .then((user) => {
        user.post.pull(postId);
        return user.save();
      })
      .then((result) => {
        res.status(200).json({ message: 'Post deleted' });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  },
  updatePost: (req, res, next) => {
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
    Post.findById(id)
      .then((post) => {
        if (!post) {
          const error = new Error('Error fetching post');
          error.statusCode = 404;
          throw error;
        }
        if (post.creator.toString() !== req.userId) {
          const errors = new Error('Unauthorized action');
          errors.statusCode = 403;
          throw error;
        }
        if (imageUrl !== post.imageUrl) {
          clearImage(post.imageUrl);
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl.replace('\\', '/');
        return post.save();
      })
      .then((result) => {
        res.status(200).json({ message: 'Update Successful', post: result });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  },
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
