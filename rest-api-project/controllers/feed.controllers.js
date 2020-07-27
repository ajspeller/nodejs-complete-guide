module.exports = {
  getPosts: (req, res, next) => {
    res
      .status(200)
      .json({ posts: [{ title: 'first', content: 'just a test' }] });
  },
  getPost: (req, res, next) => {
    const { id } = req.params;
    res
      .status(200)
      .json({ posts: [{ title: 'first', content: 'just a test' }] });
  },
  createPost: (req, res, next) => {
    const { title, content } = req.body;
    console.log(title, content);
    res.status(201).json({
      message: 'post created',
      post: { id: new Date().getTime(), title, content },
    });
  },
  deletePost: (req, res, next) => {
    const { id } = req.params;
    res.status(204);
  },
  updatePost: (req, res, next) => {
    const { id } = req.params;
    res.status(200);
  },
};
