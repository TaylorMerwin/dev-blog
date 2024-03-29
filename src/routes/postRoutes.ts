/* Routes for creating, editing, and deleting posts */
import express from 'express';
import { createBlogPost, deleteBlogPost, updateBlogPost, getPost } from '../models/postModel';
import { updateCache } from '../services/cacheService';
import { isAuthenticated } from '../middleware/authMiddleware';
import Multer from 'multer';
import * as gcs from '@google-cloud/storage';


const router = express.Router();


const storage = new gcs.Storage({
  projectId: process.env.GCLOUD_PROJECT_ID || 'bloggy-414621'
});
const bucketname = process.env.GCLOUD_STORAGE_BUCKET || 'bloggy-images';
//A bucket is a container for objects (files).
const bucket = storage.bucket(bucketname);


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

router.get('/create', isAuthenticated, (req, res) => {
  res.render('create');
});

//POST route to create a new blog post
router.post('/newPost/', multer.single('images'), async (req, res) => {

  // Extract data from request body
  const { title, description: postDescription, content } = req.body;
  let fileName = '';

  if (!title || !postDescription || !content) {
    return res.status(400).send('All fields are required');
  }

  if (!req.session.user) {
    return res.status(401).send('Please log in to create a post.');
  }

  try {
    if (req.file) {
      // Extract just the file name from the paths
      const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      fileName = `uploads/${uniquePrefix}-${req.file.originalname}`;
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream();
      await new Promise<void>((resolve, reject) => {
        blobStream.on('error', reject);
        blobStream.on('finish', () => {
          //const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve();
        });
        blobStream.end(req.file?.buffer);
      });
    }
  
  const authorId = req.session.user.userId;
  await createBlogPost(title, postDescription, content, authorId, fileName);
    // Update the cache on CRUD operations
  await updateCache();
    //Finally, all operations successfuly complete. redirect to the home page
  res.redirect('/');
  
  } catch (error) {
      console.error('Error in POST /newPost/ handler:', error);
      if (!res.headersSent) {
        res.status(500).send('Error creating post');
      }
    }
});

// Process the file upload and upload to Google Cloud Storage.
router.post('/upload', multer.single('file'), (req, res, next) => {
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

router.get('/edit/:post_id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.post_id;
    const post = await getPost(id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.render('edit', { post });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching post for editing');
  }
});

// Update an existing blog post
router.post('/editPost/', async (req, res) => {

    // Extract data from request body
    const { title, description: postDescription, content, postId, authorId } = req.body;
  
    if (!title || !postDescription || !content || !postId) {
      return res.status(400).send('All fields are required');
  }
  
  if (!req.session.user) {
    return res.status(401).send('Please log in to edit a post.');
  }

  if (authorId != req.session.user.userId) {
    console.log('User ID:', req.session.user.userId);
    console.log('Author ID:', authorId);
    return res.status(403).send('You are not authorized to edit this post.');
  }

  try {

    const updateResult = await updateBlogPost(postId, title, postDescription, content);
    // Update the cache on CRUD operations
    if (updateResult && updateResult.postId) {
    await updateCache();
    res.redirect(`/`);
  } else {
    res.status(404).send('Something went wrong');
  }
} catch (error) {
  console.error("Error in POST /editPost/ handler:", error);
  if (!res.headersSent) {
    res.status(500).send('Error updating post');
  }
}
});




// Delete Blog post by id route
router.post('/deletePost/:post_id', async (req, res) => {
  const postID = parseInt(req.params.post_id, 10);
  if (isNaN(postID)) {
    return res.status(400).send('Invalid post ID.');
  }

  try {
    await deleteBlogPost(postID);
    console.log(`Post with ID ${postID} deleted.`);
    // Update the cache on CRUD operations
    await updateCache();
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;