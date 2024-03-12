// import mysql from 'mysql2/promise';
// import { RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

// const pool = mysql.createPool({
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   database: process.env.MYSQL_DATABASE,
//   password: process.env.MYSQL_PASSWORD,
//   ssl: {
//     rejectUnauthorized: true
// }
// });
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
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

// Testing out the new formatting for postgres
export async function getPost(postID: string) {
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
    BlogPosts.post_id = $1`;

  // Execute the query
  const result = await pool.query(query, [postID]);
  // Access the rows from the result
  const rows = result.rows;
  // Since you're expecting a single post, you can directly return the first row if it exists
  return rows || null; // This returns the first row (your post) or null if no post was found
}

export async function getPostPreview(postID: string) {
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

  // Execute the query
  const result = await pool.query(query, [postID]);
  // Access the rows from the result
  const rows = result.rows;
  // Return the first row (your post preview) or null if no post was found
  return rows || null;
}

export async function getPosts() {
    const query = `
    SELECT * FROM BlogPosts`;

    const result = await pool.query(query);
    const rows = result.rows;
    return rows || null;
}

export async function getUserPosts(authorID: string) {
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

export async function getUsers() {
  const query = 'SELECT username, password_hash FROM Users';
      const result = await pool.query(query);
      const rows = result.rows;
      return rows || null;
}

interface User {
  user_id: number;
  username: string;
  password_hash: string;
}

// Returns a user entry from the Users table by username
export async function getUserByUsername(username: string) {
  const query = `
  SELECT * 
  FROM Users
  WHERE username = $1`;

  const result = await pool.query(query, [username]);
  const rows = result.rows;
  return rows[0] as User;
}

// Insert Functions
// Create new blog post
export async function createBlogPost(
  title: string, 
  postDescription: string, 
  content: string, 
  authorId: number, 
  imagePath: string | null
) {
  const query = `
  INSERT INTO BlogPosts (title, post_description, content, author_id, image_path)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING post_id`; // Assuming 'post_id' is the primary key column

  // Execute the query with the provided parameters and capture the returned value
  const result = await pool.query(query, [title, postDescription, content, authorId, imagePath]);
  // Extract the post_id of the newly created row
  const postId = result.rows[0].post_id;
  // Return the ID of the newly inserted post
  return { message: 'Blog post created successfully', postId };
}


// Create new user
export async function createUser(username: string, email: string, passwordHash: string) {
  const query = `
  INSERT INTO Users (username, email, password_hash)
  VALUES ($1, $2, $3)`;
  await pool.query(query, [username, email, passwordHash]);
  return { message: 'User created successfully' };
}
