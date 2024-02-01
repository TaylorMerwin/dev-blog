"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlogPost = exports.getPosts = exports.getPostPreview = exports.getPost = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD,
    ssl: {
        rejectUnauthorized: true
    }
});
async function getPost(postID) {
    const [row] = await pool.query(`
  SELECT *
  FROM BlogPosts
  WHERE post_id = ?`, [postID]);
    return [row];
}
exports.getPost = getPost;
async function getPostPreview(postID) {
    const [row] = await pool.query(`
  SELECT 
    BlogPosts.title, 
    BlogPosts.post_description, 
    BlogPosts.created_at, 
    Users.username AS author_name
  FROM 
    BlogPosts 
  INNER JOIN 
    Users ON BlogPosts.author_id = Users.user_id
  WHERE 
    BlogPosts.post_id = ?`, [postID]);
    return row;
}
exports.getPostPreview = getPostPreview;
async function getPosts() {
    try {
        const [rows] = await pool.query(`
    SELECT * FROM BlogPosts`);
        return rows;
    }
    catch (error) {
        console.error(error);
        throw error; // re-throw the error so it can be handled by your error handling middleware
    }
}
exports.getPosts = getPosts;
// Create a new blog post 
async function createBlogPost(title, postDescription, content, authorId, imagePath) {
    // Construct the SQL query with placeholders for the parameters
    const query = `
  INSERT INTO BlogPosts (title, post_description, content, author_id, image_path)
  VALUES (?, ?, ?, ?, ?)`;
    // Execute the query with the provided parameters.
    // If imagePath is not provided, it defaults to NULL.
    await pool.query(query, [title, postDescription, content, authorId, imagePath]);
    // Optionally, you can return some data, like a confirmation message or the ID of the newly inserted post
    return { message: 'Blog post created successfully' };
}
exports.createBlogPost = createBlogPost;
