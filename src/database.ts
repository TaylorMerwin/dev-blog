import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  ssl: {
    rejectUnauthorized: true
}
});

//Retrieval functions

export async function getPost(postID: string) {
  const [row] = await pool.query(`
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
    BlogPosts.post_id = ?`, [postID]);
  return row;
}

export async function getPostPreview(postID: string) {
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

export async function getPosts() {
  try {
    const [rows] = await pool.query(`
    SELECT * FROM BlogPosts`);
    return rows;
  } catch (error) {
    console.error(error);
    throw error; // re-throw the error so it can be handled by your error handling middleware
  }
}

export async function getPostsWithAuthor() {
  const [row] = await pool.query(`
  SELECT 
    BlogPosts.title, 
    BlogPosts.post_description, 
    BlogPosts.created_at,
    BlogPosts.image_path, 
    Users.username AS author_name
  FROM 
    BlogPosts 
  INNER JOIN 
    Users ON BlogPosts.author_id = Users.user_id`);
  return row;
}

export async function getUserPosts(authorID: string) {
  const [row] = await pool.query(`
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
    BlogPosts.author_id = ?`, [authorID]);
  return row;
}

export async function getUsers() {
  try {
      const query = 'SELECT username, password_hash FROM Users';
      const [users] = await pool.query(query);
      return users;
  } catch (error) {
      console.error('Error fetching users:', error);
      throw error; // or handle it as needed
  }
}

interface User {
  user_id: number;
  username: string;
  password_hash: string;

  // include other properties as needed
}

// Returns a user entry from the Users table by username
export async function getUserByUsername(username: string): Promise<User | null> {
  const [rows] = await pool.query<RowDataPacket[]>(`
  SELECT * 
  FROM Users
  WHERE username = ?`, [username]);

  if (!rows.length) {
    return null;
  }

  return rows[0] as User;
}

// Insert Functions

// Create a new blog post 
export async function createBlogPost(
  title: string, 
  postDescription: string, 
  content: string, 
  authorId: number, 
  imagePath: string | null
) {
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


export async function createUser(username: string, email: string, passwordHash: string) {
  const query = `
  INSERT INTO Users (username, email, password_hash)
  VALUES (?, ?, ?)`;

  await pool.query(query, [username, email, passwordHash]);

  return { message: 'User created successfully' };
}
