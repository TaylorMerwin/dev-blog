import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware";
import { getUserByUsername } from "../models/userModel";
import { getUserPosts } from "../models/postModel";

const router = express.Router();

router.get("/user", isAuthenticated, async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    const userInfo = await getUserByUsername(req.session.user.username);
    const posts = await getUserPosts(req.session.user.userId.toString());
    res.render("user", { posts, userInfo, user: req.session.user });
  } catch (error) {
    res.status(500).send("Error fetching posts");
  }
});

export default router;
