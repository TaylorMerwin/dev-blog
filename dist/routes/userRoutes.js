"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const userModel_1 = require("../models/userModel");
const postModel_1 = require("../models/postModel");
const router = express_1.default.Router();
router.get('/user', authMiddleware_1.isAuthenticated, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).send('Please log in to view this page.');
        }
        const userInfo = await (0, userModel_1.getUserByUsername)(req.session.user.username);
        const posts = await (0, postModel_1.getUserPosts)(req.session.user.userId.toString());
        res.render('user', { posts, userInfo, user: req.session.user });
    }
    catch (error) {
        res.status(500).send('Error fetching posts');
    }
});
exports.default = router;
