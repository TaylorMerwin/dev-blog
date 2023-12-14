import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';
import multer from 'multer';
import {getUsers} from './database.js';

// Create __dirname equivalent in ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});

const upload = multer({storage: storage}).fields([
  {name: 'images', maxCount: 5},
  {name: 'croppedImage', maxCount: 1},
]);

// Middleware to parse POST requests
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// get all users
app.get('/users', async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users); // Use res.json to send JSON response
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
});

app.post(
    '/updateData',
    (req, res, next) => {
      upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
          console.error('Multer error:', err);
          return res.status(500).send('Error uploading file.');
        } else if (err) {
          console.error('Unknown upload error:', err);
          return res.status(500).send('Unknown error.');
        }

        // If everything is fine, continue to the next middleware.
        next();
      });
    },
    (req, res) => {
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);

      fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }

        const jsonData = JSON.parse(data);

        // Determine the next ID
        // If there are no posts, start with ID 1
        // otherwise, increment the highest ID by 1
        const nextId =
        jsonData.posts.length > 0 ?
          Math.max(...jsonData.posts.map((post) => post.id)) + 1 :
          1;

        const newPost = {
          id: nextId,
          title: req.body.title,
          author: req.body.author,
          date: req.body.date,
          description: req.body.description,
          content: req.body.content,
          images: req.files.croppedImage ?
          [req.files.croppedImage[0].path] :
          req.files.images ?
          req.files.images.map((file) => file.path) :
          [],
        };

        jsonData.posts.push(newPost);

        fs.writeFile(
            'data.json',
            JSON.stringify(jsonData, null, 2),
            (writeErr) => {
              if (writeErr) {
                console.error(writeErr);
                return res.status(500).send('Internal Server Error');
              }
              res.status(200).send('Post Added Successfully');
            },
        );
      });
    },
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Server running on port 8080');
});


