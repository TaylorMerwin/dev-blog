"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* Routes for viewing homepage and blog posts */
const express_1 = __importDefault(require("express"));
const postModel_1 = require("../models/postModel");
const cacheService_1 = require("../services/cacheService");
const router = express_1.default.Router();
// Page routes
router.get("/", async (req, res) => {
    let posts = [];
    // check if the cache is too old
    if ((0, cacheService_1.isCacheStale)()) {
        await (0, cacheService_1.updateCache)();
    }
    posts = (0, cacheService_1.getCachedPosts)();
    res.render("index", { posts, user: req.session.user });
});
router.get("/view/:post_id", async (req, res) => {
    try {
        const id = req.params.post_id;
        const post = await (0, postModel_1.getPost)(id); // This should return a single post object
        if (!post) {
            return res.status(404).send("Post not found");
        }
        res.render("view", { post }); // Pass the post to the view.ejs template
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error fetching post");
    }
});
exports.default = router;
