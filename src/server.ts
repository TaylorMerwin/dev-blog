import express from 'express';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';

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

import { getPost, getPosts, getUsers, getPostPreview, createBlogPost, createUser, getUserByUsername } from './database';

const app = express();
const port = 8080;
app.set("view engine", "ejs");


// app.js
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// Page routes

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

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

// Action routes

app.post('/loginAction/', async (req, res) => {
  const { username, password } = req.body; // Ensure these match your form input names
  if (!username || !password) {
      // Handle missing username or password appropriately
      return res.status(400).send("Username and password are required.");
  }

  try {
      // Use the getUserByUsername function here
      const user = await getUserByUsername(username);
      if (user) {
          // Use bcrypt.compare to compare the password with the hashed password
          const match = await bcrypt.compare(password, user.password_hash);
          if (match) {
              // Proceed with login success logic
              res.send('Logged in!');
          } else {
              res.send('Invalid password.');
          }
      } else {
          res.send('User not found.');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error.');
  }
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

// get all users (usernames and passwords)
app.get('/getUsers/', async (req, res) => {
  try {
    const users = await getUsers(); // Fetch all users
    res.json(users); // Send the users as JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
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
  let imagePath = null;

  if (req.file) {
      // Extract just the file name from the path
      imagePath = path.basename(req.file.path);
  }

  //Check that all fields have data in them
    // Check if all fields have data
    if (!title || !postDescription || !content) {
      return res.status(400).send('All fields are required');
    }

  // Hardcode the authorId as 1 for now (Until we implement authentication/user login)
  const authorId = 1;

  try {
      console.log('Calling createBlogPost...');
      await createBlogPost(title, postDescription, content, authorId, imagePath);
      console.log('createBlogPost executed, sending response...');
      res.redirect('/');
  } catch (error) {
      console.error('Error in POST /newPost/ handler:', error);
      res.status(500).send('Error creating post');
  }
});


// POST route to create a new user
app.post('/registerAction/', async (req, res) => {
  console.log('Handling POST /newUser/ request...');

  // Extract data from request body
  const { username, email, password } = req.body;

  try {

    if (!username || !password) {
      // Handle missing username or password appropriately
      return res.status(400).send("Username and password are required.");
  }

      // check if user already exists
      // Use the getUserByUsername function here
      const user = await getUserByUsername(username);

      // User already exists
      if (user) {
          res.send('Username already taken.');
      }

      else if (password.length < 8) {
          res.send('Password must be at least 8 characters.');
      }

      // Ensure valid email format
      else if (!email.includes('@')) {
          res.send('Invalid email.');
      }

      // basic validation good, continue
      else {

      console.log('Hashing PW...');

      // Hash the password
      const password_hash = await bcrypt.hash(password, 10);

      await createUser(username, email, password_hash);
      console.log('createUser executed, sending response...');
      res.redirect('/login');


  }} catch (error) {
      console.error('Error in POST /newUser/ handler:', error);
      res.status(500).send('Error creating user');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});