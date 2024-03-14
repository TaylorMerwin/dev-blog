"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlogPost = exports.createUser = exports.createBlogPost = exports.getUserByUsername = exports.getUsers = exports.getUserPosts = exports.getPostsWithAuthor = exports.getPosts = exports.getPostPreview = exports.getPost = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
dotenv_1.default.config();
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const pool = new pg_1.Pool({
    host: PGHOST,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: {
        rejectUnauthorized: true,
    },
});
//Retrieval functions
async function getPost(postID) {
    const query = `
  SELECT 
    BlogPosts.title, 
    BlogPosts.content, 
    BlogPosts.created_at, 
    BlogPosts.image_path,
    BlogPosts.post_id,
    Users.username AS author_name
  FROM 
    BlogPosts 
  INNER JOIN 
    Users ON BlogPosts.author_id = Users.user_id
  WHERE 
    BlogPosts.post_id = $1`;
    const result = await pool.query(query, [postID]);
    const rows = result.rows;
    return rows || null;
}
exports.getPost = getPost;
async function getPostPreview(postID) {
    const query = `
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
    BlogPosts.post_id = $1`;
    const result = await pool.query(query, [postID]);
    const rows = result.rows;
    return rows || null;
}
exports.getPostPreview = getPostPreview;
async function getPosts() {
    const query = `
    SELECT * FROM BlogPosts`;
    const result = await pool.query(query);
    const rows = result.rows;
    return rows || null;
}
exports.getPosts = getPosts;
async function getPostsWithAuthor() {
    const query = `
  SELECT 
    BlogPosts.title, 
    BlogPosts.post_description, 
    BlogPosts.created_at,
    BlogPosts.image_path,
    BlogPosts.post_id, 
    Users.username AS author_name
  FROM 
    BlogPosts 
  INNER JOIN 
    Users ON BlogPosts.author_id = Users.user_id`;
    const result = await pool.query(query);
    const rows = result.rows;
    return rows || null;
}
exports.getPostsWithAuthor = getPostsWithAuthor;
async function getUserPosts(authorID) {
    const query = `
  SELECT 
    BlogPosts.title, 
    BlogPosts.content, 
    BlogPosts.created_at, 
    BlogPosts.image_path,
    Users.username AS author_name
  FROM 
    BlogPosts 
  INNER JOIN 
    Users ON BlogPosts.author_id = Users.user_id
  WHERE 
    BlogPosts.author_id = $1`;
    const result = await pool.query(query, [authorID]);
    const rows = result.rows;
    return rows || null;
}
exports.getUserPosts = getUserPosts;
async function getUsers() {
    const query = 'SELECT username, password_hash FROM Users';
    const result = await pool.query(query);
    const rows = result.rows;
    return rows || null;
}
exports.getUsers = getUsers;
// Returns a user entry from the Users table by username
async function getUserByUsername(username) {
    const query = `
  SELECT * 
  FROM Users
  WHERE username = $1`;
    const result = await pool.query(query, [username]);
    const rows = result.rows;
    return rows[0];
}
exports.getUserByUsername = getUserByUsername;
// Insert Functions
// Create new blog post
async function createBlogPost(title, postDescription, content, authorId, imagePath) {
    const query = `
  INSERT INTO BlogPosts (title, post_description, content, author_id, image_path)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING post_id`;
    const result = await pool.query(query, [title, postDescription, content, authorId, imagePath]);
    const postId = result.rows[0].post_id;
    return { message: 'Blog post created successfully', postId };
}
exports.createBlogPost = createBlogPost;
// Create new user
async function createUser(username, email, passwordHash) {
    const query = `
  INSERT INTO Users (username, email, password_hash)
  VALUES ($1, $2, $3)`;
    await pool.query(query, [username, email, passwordHash]);
    return { message: 'User created successfully' };
}
exports.createUser = createUser;
// Delete Blog Post
async function deleteBlogPost(postID) {
    const query = 'DELETE FROM BlogPosts WHERE post_id = $1';
    await pool.query(query, [postID]);
}
exports.deleteBlogPost = deleteBlogPost;
