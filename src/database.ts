import mysql from 'mysql2/promise';
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


export async function getPost(postID: string) {
  const [row] = await pool.query(`
  SELECT *
  FROM BlogPosts
  WHERE post_id = ?`, [postID]);
  return [row];
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

