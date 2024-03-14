import express from 'express';
import Multer from 'multer';
import * as gcs from '@google-cloud/storage';
//import path from 'path';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { getPost, getPosts, getPostsWithAuthor, getUsers, getPostPreview, getUserPosts, createUser, createBlogPost, getUserByUsername, deleteBlogPost } from './database';

declare module 'express-session' {
  export interface SessionData {
    user: {userId: number; username: string; };
  }
}

// OLD
// Configure multer storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         // Generate a unique file name with the original extension
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });
//const upload = multer({ storage: storage });


const app = express();
const PORT = process.env.PORT || 8080;


const storage = new gcs.Storage({
  projectId: process.env.GCLOUD_PROJECT_ID || 'bloggy-414621'
});
const bucketname = process.env.GCLOUD_STORAGE_BUCKET || 'bloggy-414621.appspot.com';


//A bucket is a container for objects (files).
const bucket = storage.bucket(bucketname);

// async function authenticateImplicitWithAdc() {
//   // This snippet demonstrates how to list buckets.
//   // NOTE: Replace the client created below with the client required for your application.
//   // Note that the credentials are not specified when constructing the client.
//   // The client library finds your credentials using ADC.

//   const [buckets] = await storage.getBuckets();
//   console.log('Buckets:');

//   for (const bucket of buckets) {
//     console.log(`- ${bucket.name}`);
//   }

//   console.log('Listed all storage buckets.');
// }

// authenticateImplicitWithAdc();


app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
  secret: 'my_secret_key',
  resave: false,
  saveUninitialized: false,
}))

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // No larger than 10mb
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      // Accept the file
      cb(null, true);
    } else {
      // Reject the file
      cb(null, false);
    }
  }
});

function isAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.session.user) {
    next(); // The user is logged in, proceed to the route handler
  } else {
    // User is not logged in, send an error message or redirect to login
    res.status(401).send('Please log in to view this page.');
    // Or redirect to login page: res.redirect('/login');
  }
}

// Page routes
app.get('/', async (req, res) => {
  try {
    const posts = await getPostsWithAuthor(); // Fetch all posts
    res.render('index', { posts, user: req.session.user });  // Pass the posts to the template
  } catch (error) {
    res.status(500).send('Error fetching posts');
  }
});

app.get('/view/:post_id', async (req, res) => {
  try {
    const id = req.params.post_id;
    const post = await getPost(id); // This should return a single post object
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.render('view', { post } ); // Pass the post to the view.ejs template
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching post');
  }
});

app.get('/create', isAuthenticated, (req, res) => {
  res.render('create');
});

app.get('/user', isAuthenticated, async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).send('Please log in to view this page.');
    }
    const userInfo = await getUserByUsername(req.session.user.username);
  const posts = await getUserPosts(req.session.user.userId.toString());
  res.render('user', { posts, userInfo, user: req.session.user });
  }
  catch (error) {
    res.status(500).send('Error fetching posts');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

// Action routes

app.post('/loginAction/', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }
  try {
    const user = await getUserByUsername(username);
    //console.log('User:', user);
    if (user) {
      const match = await bcrypt.compare(password, user.password_hash);
      if (match) {
        // Set user session
        req.session.user = { userId: user.user_id, username: username };
        res.redirect('/');

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

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send("Could not log out.");
    }
    console.log('Congratulations! You are the first person to log out');
    res.redirect('/');
  });
});

// Delete blog post by id route
app.post('/deletePost/:post_id', async (req, res) => {
  const postID = parseInt(req.params.post_id, 10);
  if (isNaN(postID)) {
    return res.status(400).send('Invalid post ID.');
  }

  try {
    await deleteBlogPost(postID);
    console.log(`Post with ID ${postID} deleted.`);
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).send('Internal Server Error');
  }
});

//POST route to create a new blog post
app.post('/newPost/', multer.single('images'), async (req, res, next) => {

  // Extract data from request body
  const { title, description: postDescription, content } = req.body;
  let fileName = '';

  if (req.file) {
      // Extract just the file name from the paths
      const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      fileName = `uploads/${uniquePrefix}-${req.file.originalname}`;
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream();
    
      blobStream.on('error', (err: Error) => {
        next(err);
      });
      
    
      blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        res.status(200).send(publicUrl);
      });
    
      blobStream.end(req.file.buffer);
  }

  if (!title || !postDescription || !content) {
      return res.status(400).send('All fields are required');
  }

  try {
    if (!req.session.user) {
      return res.status(401).send('Please log in to create a post.');
    }
      const authorId = req.session.user.userId;
      await createBlogPost(title, postDescription, content, authorId, fileName);
      res.redirect('/');
  } catch (error) {
      console.error('Error in POST /newPost/ handler:', error);
      res.status(500).send('Error creating post');
  }
});

// // POST route to create a new user
app.post('/registerAction/', async (req, res) => {
  // Extract data from request body
  const { username, email, password } = req.body;
  try {
    if (!username || !password) {
      // Handle missing username or password appropriately
      return res.status(400).send("Username and password are required.");
    }
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
      // Hash the password
      const password_hash = await bcrypt.hash(password, 10);
      
      await createUser(username, email, password_hash);
      res.redirect('/login');
  }} catch (error) {
      res.status(500).send(`Error creating user, ${error}`);
  }
});

// Process the file upload and upload to Google Cloud Storage.
app.post('/upload', multer.single('file'), (req, res, next) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const newFileName = `uploads/${req.file.originalname}`;
  const blob = bucket.file(newFileName);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err: Error) => {
    next(err);
  });
  
  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    blob.makePublic().then(() => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send(publicUrl);
    });
  });
    blobStream.end(req.file.buffer);
});


// Not being used in app but helpful for testing

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});