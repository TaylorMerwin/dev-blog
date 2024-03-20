import dotenv from 'dotenv';
import { Pool } from 'pg';
import { User, Post, PostPreview } from './types';
dotenv.config();

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
export async function getPost(postID: string) {
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
  return result.rows as Post[];
}

export async function getPostPreviews(lastPostId?: number, limit = 10) {

  // Only apply the WHERE clause if lastPostId is provided and greater than 0
  const whereClause = lastPostId && lastPostId > 0 ? `WHERE post_id < $1` : '';
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
    Users ON BlogPosts.author_id = Users.user_id
    ${whereClause}
    ORDER BY
    BlogPosts.post_id ASC
    LIMIT $2`;

  const params = whereClause ? [lastPostId, limit] : [limit];
  const result = await pool.query(query, params);
  return result.rows as PostPreview[];
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
  RETURNING post_id`;

  const result = await pool.query(query, [title, postDescription, content, authorId, imagePath]);
  const postId = result.rows[0].post_id;
  return { message: 'Blog post created successfully', postId };
}

/**
 * Insert a new user into the Users table
 * @param username 
 * @param email 
 * @param passwordHash 
 * @returns confirmation message
 */
export async function createUser(username: string, email: string, passwordHash: string) {
  const query = `
  INSERT INTO Users (username, email, password_hash)
  VALUES ($1, $2, $3)`;
  await pool.query(query, [username, email, passwordHash]);
  return { message: 'User created successfully' };
}

// Delete Blog Post
export async function deleteBlogPost(postID: number): Promise<void> {
  const query = 'DELETE FROM BlogPosts WHERE post_id = $1';
  await pool.query(query, [postID]);
}