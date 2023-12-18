import express from 'express';

import { getPost, getPosts } from './database';

const app = express();
const port = 8080;
app.set("view engine", "ejs");


// app.js
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', async (req, res) => {
  try {
    const posts = await getPosts();
    res.render('index', { posts });
  } catch (error) {
    res.status(500).send('Error fetching posts');
  }

});


// get a post by id
app.get('/blogPost/:post_id', async (req, res) => {
  try {
    const id = req.params.post_id;
    const post = await getPost(id);
    res.json(post); // Use res.json to send JSON response
  } catch (error) {
    res.status(500).send('Error fetching post');
  }
});

// get all posts
app.get('/blogPosts/', async (req, res) => {
  console.log('Handling GET /blogPosts/ request...');
  try {
    console.log('Calling getPosts...');
    const posts = await getPosts();
    console.log('getPosts returned, sending response...');
    res.send(posts);
  } catch (error) {
    console.error('Error in GET /blogPosts/ handler:', error);
    res.status(500).send('Error fetching posts');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});