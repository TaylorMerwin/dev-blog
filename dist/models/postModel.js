"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlogViewCount = exports.deleteBlogPost = exports.updateBlogPost = exports.createBlogPost = exports.getUserPosts = exports.getPostPreviews = exports.getPost = void 0;
const database_1 = require("./database");
async function getPost(postID) {
    const query = `
  SELECT 
    BlogPosts.title, 
    BlogPosts.content, 
    BlogPosts.created_at, 
    BlogPosts.image_path,
    BlogPosts.post_id,
    BlogPosts.author_id,
    BlogPosts.view_count,
    Users.username AS author_name
  FROM 
    BlogPosts 
  INNER JOIN 
    Users ON BlogPosts.author_id = Users.user_id
  WHERE 
    BlogPosts.post_id = $1`;
    const result = await database_1.pool.query(query, [postID]);
    return result.rows;
}
exports.getPost = getPost;
async function getPostPreviews(lastPostId, limit = 10) {
    // Only apply the WHERE clause if lastPostId is provided and greater than 0
    const whereClause = lastPostId && lastPostId > 0 ? `WHERE post_id < $1` : "";
    const query = `
  SELECT 
    BlogPosts.title, 
    BlogPosts.post_description, 
    BlogPosts.created_at,
    BlogPosts.image_path,
    BlogPosts.post_id,
    BlogPosts.view_count,
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
    const result = await database_1.pool.query(query, params);
    return result.rows;
}
exports.getPostPreviews = getPostPreviews;
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
    const result = await database_1.pool.query(query, [authorID]);
    const rows = result.rows;
    return rows || null;
}
exports.getUserPosts = getUserPosts;
// Insert Functions
// Create new blog post
async function createBlogPost(title, postDescription, content, authorId, imagePath) {
    const query = `
  INSERT INTO BlogPosts (title, post_description, content, author_id, image_path)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING post_id`;
    const result = await database_1.pool.query(query, [
        title,
        postDescription,
        content,
        authorId,
        imagePath,
    ]);
    const postId = result.rows[0].post_id;
    return { message: "Blog post created successfully", postId };
}
exports.createBlogPost = createBlogPost;
// Update an existing blog post
async function updateBlogPost(postId, title, postDescription, content) {
    const query = `
  UPDATE BlogPosts
  SET title = $2, post_description = $3, content = $4
  WHERE post_id = $1
  RETURNING post_id`;
    try {
        const result = await database_1.pool.query(query, [
            postId,
            title,
            postDescription,
            content,
        ]);
        if (result.rows.length > 0) {
            return {
                message: "Blog post updated successfully",
                postId: result.rows[0].post_id,
            };
        }
        else {
            return { message: "Blog post not found / no changes made", postId: null };
        }
    }
    catch (error) {
        console.error("Error updating post:", error);
        throw error;
    }
}
exports.updateBlogPost = updateBlogPost;
// Delete Blog Post
async function deleteBlogPost(postID) {
    const query = "DELETE FROM BlogPosts WHERE post_id = $1";
    await database_1.pool.query(query, [postID]);
}
exports.deleteBlogPost = deleteBlogPost;
async function updateBlogViewCount(views, postID) {
    const query = `UPDATE BlogPosts
  SET view_count = view_count + $1
  WHERE post_id = $2`;
    try {
        const result = await database_1.pool.query(query, [views, postID]);
        if (result.rows.length > 0) {
            return {
                message: "Blog post count updated successfully",
            };
        }
        else {
            return { message: "Blog post not found / no changes made" };
        }
    }
    catch (error) {
        console.error("Error updating post:", error);
        throw error;
    }
}
exports.updateBlogViewCount = updateBlogViewCount;
