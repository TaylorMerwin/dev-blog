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

// Create a new blog post 
export async function createBlogPost(title: string, postDescription: string, content: string, authorId: number, imagePath?: string) {
  // Construct the SQL query with placeholders for the parameters
  const query = `
  INSERT INTO BlogPosts (title, post_description, content, author_id, image_path)
  VALUES (?, ?, ?, ?, ?)`;

  // Execute the query with the provided parameters.
  // If imagePath is not provided, it defaults to NULL.
  await pool.query(query, [title, postDescription, content, authorId, imagePath || null]);

  // Optionally, you can return some data, like a confirmation message or the ID of the newly inserted post
  return { message: 'Blog post created successfully' };
}


