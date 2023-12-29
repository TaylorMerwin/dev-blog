"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("./database");
const app = (0, express_1.default)();
const port = 8080;
app.set("view engine", "ejs");
// app.js
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', async (req, res) => {
    try {
        const post = await (0, database_1.getPostPreview)('1');
        res.render('index', { post });
        console.log(post);
    }
    catch (error) {
        res.status(500).send('Error fetching post');
    }
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
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
