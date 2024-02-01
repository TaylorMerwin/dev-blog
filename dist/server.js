"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generate a unique file name with the original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
const database_1 = require("./database");
const app = (0, express_1.default)();
const port = 8080;
app.set("view engine", "ejs");
// app.js
app.use(express_1.default.static('public'));
app.use('/uploads', express_1.default.static('uploads'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', async (req, res) => {
    try {
        const posts = await (0, database_1.getPosts)(); // Fetch all posts
        res.render('index', { posts }); // Pass the posts to the template
    }
    catch (error) {
        res.status(500).send('Error fetching posts');
    }
});
app.get('/create', (req, res) => {
    res.render('create');
});
// get a post by id
app.get('/blogPost/:post_id', async (req, res) => {
    try {
        const id = req.params.post_id;
        const post = await (0, database_1.getPost)(id);
        res.json(post); // Use res.json to send JSON response
    }
    catch (error) {
        res.status(500).send('Error fetching post');
    }
});
// get a post preview by id
app.get('/postPreview/:post_id', async (req, res) => {
    try {
        const id = req.params.post_id;
        const post = await (0, database_1.getPostPreview)(id);
        res.json(post); // Use res.json to send JSON response
    }
    catch (error) {
        res.status(500).send('Error fetching post');
    }
});
// get all posts
app.get('/blogPosts/', async (req, res) => {
    console.log('Handling GET /blogPosts/ request...');
    try {
        console.log('Calling getPosts...');
        const posts = await (0, database_1.getPosts)();
        console.log('getPosts returned, sending response...');
        res.send(posts);
    }
    catch (error) {
        console.error('Error in GET /blogPosts/ handler:', error);
        res.status(500).send('Error fetching posts');
    }
});
// POST route to create a new blog post
app.post('/newPost/', upload.single('images'), async (req, res) => {
    console.log('Handling POST /newPost/ request...');
    // Extract data from request body
    const { title, description: postDescription, author: authorId, content } = req.body;
    const imagePath = req.file ? req.file.path : null;
    try {
        console.log('Calling createBlogPost...');
        const result = await (0, database_1.createBlogPost)(title, postDescription, content, parseInt(authorId), imagePath);
        console.log('createBlogPost executed, sending response...');
        //res.status(201).send(result); // Puts debug message on the screen
        // Redirect the user to the home page after successful post creation
        res.redirect('/'); // Assuming '/' is your home page route
    }
    catch (error) {
        console.error('Error in POST /newPost/ handler:', error);
        res.status(500).send('Error creating post');
    }
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
