"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_session_1 = __importDefault(require("express-session"));
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
app.use(express_1.default.static('public'));
app.use('/uploads', express_1.default.static('uploads'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
    // Choose a suitable storege option? WTF is this?
}));
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
    try {
        const posts = await (0, database_1.getPosts)(); // Fetch all posts
        res.render('index', { posts, user: req.session.user }); // Pass the posts to the template
    }
    catch (error) {
        res.status(500).send('Error fetching posts');
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
        const posts = await (0, database_1.getUserPosts)(req.session.user.userId.toString());
        res.render('user', { posts, user: req.session.user });
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
        const user = await (0, database_1.getUserByUsername)(username);
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
        console.log('Congratulations! You are the first person to log out');
        res.redirect('/');
    });
});
app.get('/view/:post_id', async (req, res) => {
    try {
        const id = req.params.post_id; // Get the post id from the route parameter
        const post = await (0, database_1.getPost)(id); // Fetch the post with the given id
        // console.log("the post is " + post); // Log the post to the console to verify it was fetched
        // res.json(post);      
        res.render('view', { post, user: req.session.user }); // Pass the post to the view.ejs template
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
// get all users (usernames and passwords)
app.get('/getUsers/', async (req, res) => {
    try {
        const users = await (0, database_1.getUsers)(); // Fetch all users
        res.json(users); // Send the users as JSON response
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
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
    const { title, description: postDescription, content } = req.body;
    let imagePath = null;
    if (req.file) {
        // Extract just the file name from the path
        imagePath = path_1.default.basename(req.file.path);
    }
    //Check that all fields have data in them
    // Check if all fields have data
    if (!title || !postDescription || !content) {
        return res.status(400).send('All fields are required');
    }
    // Hardcode the authorId as 1 for now (Until we implement authentication/user login)
    //const authorId = 1;
    try {
        if (!req.session.user) {
            return res.status(401).send('Please log in to create a post.');
        }
        const authorId = req.session.user.userId;
        await (0, database_1.createBlogPost)(title, postDescription, content, authorId, imagePath);
        res.redirect('/');
    }
    catch (error) {
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
        const user = await (0, database_1.getUserByUsername)(username);
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
            const password_hash = await bcrypt_1.default.hash(password, 10);
            await (0, database_1.createUser)(username, email, password_hash);
            console.log('createUser executed, sending response...');
            res.redirect('/login');
        }
    }
    catch (error) {
        console.error('Error in POST /newUser/ handler:', error);
        res.status(500).send('Error creating user');
    }
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
