import { Post, PostPreview } from '../interfaces/types';
import { pool } from './database';

export async function getPost(postID: string) {
  const query = `
  SELECT 
    BlogPosts.title, 
    BlogPosts.content, 
    BlogPosts.created_at, 
    BlogPosts.image_path,
    BlogPosts.post_id,
    BlogPosts.author_id,
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

// Update an existing blog post
export async function updateBlogPost(
  postId: number,
  title: string, 
  postDescription: string, 
  content: string
) {
  const query = `
  UPDATE BlogPosts
  SET title = $2, post_description = $3, content = $4
  WHERE post_id = $1
  RETURNING post_id`;

  try {
    const result = await pool.query(query, [postId, title, postDescription, content]);
    if (result.rows.length > 0) {
      return { message: 'Blog post updated successfully', postId: result.rows[0].post_id };
    }
    else {
      return { message: 'Blog post not found / no changes made', postId: null };
    }
  } catch (error){
    console.error('Error updating post:', error);
    throw error;
  }
}

// Delete Blog Post
export async function deleteBlogPost(postID: number): Promise<void> {
  const query = 'DELETE FROM BlogPosts WHERE post_id = $1';
  await pool.query(query, [postID]);
}