"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const gcs = __importStar(require("@google-cloud/storage"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_session_1 = __importDefault(require("express-session"));
const userModel_1 = require("./models/userModel");
const postModel_1 = require("./models/postModel");
const cacheService_1 = require("./services/cacheService");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// Update the cache on server startup
(0, cacheService_1.updateCache)();
const storage = new gcs.Storage({
    projectId: process.env.GCLOUD_PROJECT_ID || 'bloggy-414621'
});
const bucketname = process.env.GCLOUD_STORAGE_BUCKET || 'bloggy-images';
//A bucket is a container for objects (files).
const bucket = storage.bucket(bucketname);
app.set("view engine", "ejs");
app.use(express_1.default.static('public'));
app.use(express_1.default.static('uploads'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
}));
const multer = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // No larger than 10mb
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            // Accept the file
            cb(null, true);
        }
        else {
            // Reject the file
            cb(null, false);
        }
    }
});
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next(); // The user is logged in, proceed to the route handler
    }
    else {
        // User is not logged in, send an error message or redirect to login
        res.status(401).send('Please log in to view this page.');
        // Or redirect to login page: res.redirect('/login');
    }
}
// Page routes
app.get('/', async (req, res) => {
    let posts = [];
    // check if the cache is too old
    if ((0, cacheService_1.isCacheStale)()) {
        await (0, cacheService_1.updateCache)();
    }
    posts = (0, cacheService_1.getCachedPosts)();
    res.render('index', { posts, user: req.session.user });
});
app.get('/view/:post_id', async (req, res) => {
    try {
        const id = req.params.post_id;
        const post = await (0, postModel_1.getPost)(id); // This should return a single post object
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('view', { post }); // Pass the post to the view.ejs template
    }
    catch (error) {
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
        const userInfo = await (0, userModel_1.getUserByUsername)(req.session.user.username);
        const posts = await (0, postModel_1.getUserPosts)(req.session.user.userId.toString());
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
app.get('/edit/:post_id', isAuthenticated, async (req, res) => {
    try {
        const id = req.params.post_id;
        const post = await (0, postModel_1.getPost)(id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('edit', { post });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error fetching post for editing');
    }
});
// Action routes
app.post('/loginAction/', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Username and password are required.");
    }
    try {
        const user = await (0, userModel_1.getUserByUsername)(username);
        //console.log('User:', user);
        if (user) {
            const match = await bcrypt_1.default.compare(password, user.password_hash);
            if (match) {
                // Set user session
                req.session.user = { userId: user.user_id, username: username };
                res.redirect('/');
            }
            else {
                res.send('Invalid password.');
            }
        }
        else {
            res.send('User not found.');
        }
    }
    catch (err) {
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
        await (0, postModel_1.deleteBlogPost)(postID);
        console.log(`Post with ID ${postID} deleted.`);
        // Update the cache on CRUD operations
        await (0, cacheService_1.updateCache)();
        res.redirect('/');
    }
    catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Internal Server Error');
    }
});
//POST route to create a new blog post
app.post('/newPost/', multer.single('images'), async (req, res) => {
    // Extract data from request body
    const { title, description: postDescription, content } = req.body;
    let fileName = '';
    //let publicUrl = '';
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
            await new Promise((resolve, reject) => {
                blobStream.on('error', reject);
                blobStream.on('finish', () => {
                    //const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                    resolve();
                });
                blobStream.end(req.file?.buffer);
            });
        }
        const authorId = req.session.user.userId;
        await (0, postModel_1.createBlogPost)(title, postDescription, content, authorId, fileName);
        // Update the cache on CRUD operations
        await (0, cacheService_1.updateCache)();
        //Finally, all operations successfuly complete. redirect to the home page
        res.redirect('/');
    }
    catch (error) {
        console.error('Error in POST /newPost/ handler:', error);
        if (!res.headersSent) {
            res.status(500).send('Error creating post');
        }
    }
});
// Update an existing blog post
app.post('/editPost/', async (req, res) => {
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
        const updateResult = await (0, postModel_1.updateBlogPost)(postId, title, postDescription, content);
        // Update the cache on CRUD operations
        if (updateResult && updateResult.postId) {
            await (0, cacheService_1.updateCache)();
            res.redirect(`/`);
        }
        else {
            res.status(404).send('Something went wrong');
        }
    }
    catch (error) {
        console.error("Error in POST /editPost/ handler:", error);
        if (!res.headersSent) {
            res.status(500).send('Error updating post');
        }
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
        const user = await (0, userModel_1.getUserByUsername)(username);
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
            const password_hash = await bcrypt_1.default.hash(password, 10);
            await (0, userModel_1.createUser)(username, email, password_hash);
            res.redirect('/login');
        }
    }
    catch (error) {
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
    blobStream.on('error', (err) => {
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
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
