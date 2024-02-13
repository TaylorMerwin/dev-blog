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

export async function getUserByUsername(username: string) {
  console.log("Attempting to find user: " + [username]);
  const [row] = await pool.query(`
  SELECT * 
  FROM Users
  WHERE username = ?`, [username]); 
  return row;
}

export async function getAllTableNames() {
  try {
    const query = `SHOW TABLES`;
    const [tables] = await pool.query(query) as any[];
    const tableNames = tables.map((table: any) => Object.values(table)[0]);
    return tableNames;
  } catch (error) {
    console.error('Error fetching table names:', error);
    throw error;
  }
}

