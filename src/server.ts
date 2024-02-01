import express from 'express';
import multer from 'multer';
import path from 'path';

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generate a unique file name with the original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


import { getPost, getPosts, getPostPreview, createBlogPost } from './database';

const app = express();
const port = 8080;
app.set("view engine", "ejs");


// app.js
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', async (req, res) => {
  try {
    const posts = await getPosts(); // Fetch all posts
    res.render('index', { posts });  // Pass the posts to the template
  } catch (error) {
    res.status(500).send('Error fetching posts');
  }
});

app.get('/create', (req, res) => {
  res.render('create');
});


app.get('/view/:post_id', async (req, res) => {
  try {
    const id = req.params.post_id; // Get the post id from the route parameter
    const post = await getPost(id); // Fetch the post with the given id
   // console.log("the post is " + post); // Log the post to the console to verify it was fetched
   // res.json(post);      
    res.render('view', { post } ); // Pass the post to the view.ejs template
  } catch (error) {
    res.status(500).send('Error fetching post');
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

// get a post preview by id
app.get('/postPreview/:post_id', async (req, res) => {
  try {
    const id = req.params.post_id;
    const post = await getPostPreview(id);
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

// POST route to create a new blog post
app.post('/newPost/', upload.single('images'), async (req, res) => {
  console.log('Handling POST /newPost/ request...');

  // Extract data from request body
  const { title, description: postDescription, content } = req.body;
  const imagePath = req.file ? req.file.path : null;

  // Hardcode the authorId as 1 for now (Until we implement authentication/user login)
  const authorId = 1;

  try {
      console.log('Calling createBlogPost...');
      const result = await createBlogPost(title, postDescription, content, authorId, imagePath);
      console.log('createBlogPost executed, sending response...');
      res.redirect('/');
  } catch (error) {
      console.error('Error in POST /newPost/ handler:', error);
      res.status(500).send('Error creating post');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});