/* Routes for viewing homepage and blog posts */
import express from "express";
import { getPost } from "../models/postModel";
import {
  getCachedPosts,
  isCacheStale,
  updateCache,
} from "../services/cacheService";

const router = express.Router();

// Page routes
router.get("/", async (req, res) => {
  let posts = [];
  // check if the cache is too old
  if (isCacheStale()) {
    await updateCache();
  }
  posts = getCachedPosts();
  res.render("index", { posts, user: req.session.user });
});

router.get("/view/:post_id", async (req, res) => {
  try {
    const id = req.params.post_id;
    const post = await getPost(id); // This should return a single post object
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("view", { post }); // Pass the post to the view.ejs template
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching post");
  }
});

export default router;
