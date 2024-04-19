"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = require("../models/userModel");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const router = express_1.default.Router();
router.get("/login", (req, res) => {
    res.render("login");
});
router.get("/register", (req, res) => {
    res.render("register");
});
router.post("/loginAction/", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Username and password are required. 😒");
    }
    try {
        const user = await (0, userModel_1.getUserByUsername)(username);
        //console.log('User:', user);
        if (user) {
            const match = await bcrypt_1.default.compare(password, user.password_hash);
            if (match) {
                // Set user session
                req.session.user = { userId: user.user_id, username: username };
                res.redirect("/");
            }
            else {
                res.send("Invalid password.");
            }
        }
        else {
            res.send("User not found.");
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error.");
    }
});
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Could not log out. 😱");
        }
        res.redirect("/");
    });
});
// // POST route to create a new user
router.post("/registerAction/", validationMiddleware_1.validateRegistration, async (req, res) => {
    // Extract data from request body
    const { username, email, password } = req.body;
    try {
        const userWithUsername = await (0, userModel_1.getUserByUsername)(username);
        const userWithEmail = await (0, userModel_1.getUserByEmail)(email);
        // User already exists
        if (userWithUsername) {
            return res.render("register", {
                message: "Username already taken.",
                email,
            });
        }
        if (userWithEmail) {
            return res.render("Register", {
                message: "Email already taken.",
                username,
            });
        }
        const password_hash = await bcrypt_1.default.hash(password, 10);
        await (0, userModel_1.createUser)(username, email, password_hash);
        res.redirect("/login");
    }
    catch (error) {
        console.log("Error caught: " + error);
        if (error instanceof Error) {
            res.render("register", {
                message: `Error creating user: ${error}`,
            });
        }
    }
});
exports.default = router;
