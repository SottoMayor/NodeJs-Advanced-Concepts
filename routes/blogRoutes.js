const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    // Redis Goal: Catch queried data when we search at the first time in the DB and store it.
    //             When we need it, redis will return this data without consulting the database.

    const redis = require('redis'); // npm install --save redis
    const redisUrl = 'redis://127.0.0.1:6379' // localhost
    const redisClient = redis.createClient(redisUrl);
    // Now, we wanna add promise to a 'redisClient.get', actually this function only work with callback.
    const util = require('util');
    redisClient.get = util.promisify(redisClient.get);

    // Redis Flow 1: Do we have any cached data in redis related to this query?
    const cachedBlogs = await redisClient.get(req.user.id);
    const parsedBlogs = JSON.parse(cachedBlogs); // JSON to JS Object!
    
    console.log(parsedBlogs);

    // Redis Flow 2: If yes, respond to the resquest right away and return it.
    if(parsedBlogs){
      console.log('SERVING REDIS');
      return res.status(200).json({parsedBlogs: parsedBlogs});
    }

    // Redis Flow 3: If no, we need to responde to the resquest and update the cache 
    //               to store data.
    const blogs = await Blog.find({ _user: req.user.id });

    console.log('SERVING DB');
    res.send(blogs);

    redisClient.set(req.user.id, JSON.stringify(blogs));
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
