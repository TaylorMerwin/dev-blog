const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.get('/getLatestPost', (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
    const latestPost = data.posts[data.posts.length - 1]; // Assuming the latest post is at the end
    res.json(latestPost);
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware to parse POST requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

app.post('/updateData', (req, res, next) => {
    upload.array('images')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Multer error:", err);
            return res.status(500).send("Error uploading file.");
        } else if (err) {
            console.error("Unknown upload error:", err);
            return res.status(500).send("Unknown error.");
        }
        
        // If everything is fine, continue to the next middleware.
        next();
    });
}, (req, res) => {
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    const newPost = {
        title: req.body.title,
        author: req.body.author,
        date: req.body.date,
        content: req.body.content,
        images: req.files.map(file => file.path)
    };

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        
        let jsonData = JSON.parse(data);
        jsonData.posts.push(newPost);
        
        fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).send('Post Added Successfully');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
