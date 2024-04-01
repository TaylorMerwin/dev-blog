"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* Routes for creating, editing, and deleting posts */
const express_1 = __importDefault(require("express"));
const postModel_1 = require("../models/postModel");
const cacheService_1 = require("../services/cacheService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const gcs = __importStar(require("@google-cloud/storage"));
const router = express_1.default.Router();
const storage = new gcs.Storage({
    projectId: process.env.GCLOUD_PROJECT_ID || "bloggy-414621",
});
const bucketname = process.env.GCLOUD_STORAGE_BUCKET || "bloggy-images";
//A bucket is a container for objects (files).
const bucket = storage.bucket(bucketname);
const multer = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // No larger than 10mb
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            // Accept the file
            cb(null, true);
        }
        else {
            // Reject the file
            cb(null, false);
        }
    },
});
router.get("/create", authMiddleware_1.isAuthenticated, (req, res) => {
    res.render("create");
});
//POST route to create a new blog post
router.post("/newPost/", multer.single("images"), async (req, res) => {
    // Extract data from request body
    const { title, description: postDescription, content } = req.body;
    let fileName = "";
    if (!title || !postDescription || !content) {
        return res.status(400).send("All fields are required");
    }
    if (!req.session.user) {
        return res.status(401).send("Please log in to create a post.");
    }
    try {
        if (req.file) {
            // Extract just the file name from the paths
            const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            fileName = `uploads/${uniquePrefix}-${req.file.originalname}`;
            const blob = bucket.file(fileName);
            const blobStream = blob.createWriteStream();
            await new Promise((resolve, reject) => {
                blobStream.on("error", reject);
                blobStream.on("finish", () => {
                    //const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                    resolve();
                });
                blobStream.end(req.file?.buffer);
            });
        }
        const authorId = req.session.user.userId;
        await (0, postModel_1.createBlogPost)(title, postDescription, content, authorId, fileName);
        // Update the cache on CRUD operations
        await (0, cacheService_1.updateCache)();
        //Finally, all operations successfuly complete. redirect to the home page
        res.redirect("/");
    }
    catch (error) {
        console.error("Error in POST /newPost/ handler:", error);
        if (!res.headersSent) {
            res.status(500).send("Error creating post");
        }
    }
});
// Process the file upload and upload to Google Cloud Storage.
router.post("/upload", multer.single("file"), (req, res, next) => {
    if (!req.file) {
        res.status(400).send("No file uploaded.");
        return;
    }
    // Create a new blob in the bucket and upload the file data.
    const newFileName = `uploads/${req.file.originalname}`;
    const blob = bucket.file(newFileName);
    const blobStream = blob.createWriteStream();
    blobStream.on("error", (err) => {
        next(err);
    });
    blobStream.on("finish", () => {
        // The public URL can be used to directly access the file via HTTP.
        blob.makePublic().then(() => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            res.status(200).send(publicUrl);
        });
    });
    blobStream.end(req.file.buffer);
});
router.get("/edit/:post_id", authMiddleware_1.isAuthenticated, async (req, res) => {
    try {
        const id = req.params.post_id;
        const post = await (0, postModel_1.getPost)(id);
        if (!post) {
            return res.status(404).send("Post not found");
        }
        res.render("edit", { post });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error fetching post for editing");
    }
});
// Update an existing blog post
router.post("/editPost/", async (req, res) => {
    // Extract data from request body
    const { title, description: postDescription, content, postId, authorId, } = req.body;
    if (!title || !postDescription || !content || !postId) {
        return res.status(400).send("All fields are required");
    }
    if (!req.session.user) {
        return res.status(401).send("Please log in to edit a post.");
    }
    if (authorId != req.session.user.userId) {
        console.log("User ID:", req.session.user.userId);
        console.log("Author ID:", authorId);
        return res.status(403).send("You are not authorized to edit this post.");
    }
    try {
        const updateResult = await (0, postModel_1.updateBlogPost)(postId, title, postDescription, content);
        // Update the cache on CRUD operations
        if (updateResult && updateResult.postId) {
            await (0, cacheService_1.updateCache)();
            res.redirect(`/`);
        }
        else {
            res.status(404).send("Something went wrong");
        }
    }
    catch (error) {
        console.error("Error in POST /editPost/ handler:", error);
        if (!res.headersSent) {
            res.status(500).send("Error updating post");
        }
    }
});
// Delete Blog post by id route
router.post("/deletePost/:post_id", async (req, res) => {
    const postID = parseInt(req.params.post_id, 10);
    if (isNaN(postID)) {
        return res.status(400).send("Invalid post ID.");
    }
    if (!req.session.user) {
        return res.status(401).send("Please log in to delete a post.");
    }
    try {
        const posts = await (0, postModel_1.getPost)(postID.toString());
        const post = posts[0];
        if (!post) {
            return res.status(404).send("Post not found");
        }
        const authorId = post.author_id;
        if (authorId != req.session.user.userId) {
            return res
                .status(403)
                .send("You are not authorized to delete this post.");
        }
        await (0, postModel_1.deleteBlogPost)(postID);
        // Update the cache on CRUD operations
        await (0, cacheService_1.updateCache)();
        res.redirect("/");
    }
    catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Internal Server Error");
    }
});
exports.default = router;
