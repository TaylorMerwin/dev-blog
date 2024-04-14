import express from "express";
import bcrypt from "bcrypt";
import {
  createUser,
  getUserByUsername,
  getUserByEmail,
} from "../models/userModel";
import { validateRegistration } from "../middleware/validationMiddleware";

const router = express.Router();

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
    const user = await getUserByUsername(username);
    //console.log('User:', user);
    if (user) {
      const match = await bcrypt.compare(password, user.password_hash);
      if (match) {
        // Set user session
        req.session.user = { userId: user.user_id, username: username };
        res.redirect("/");
      } else {
        res.send("Invalid password.");
      }
    } else {
      res.send("User not found.");
    }
  } catch (err) {
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
router.post("/registerAction/", validateRegistration, async (req, res) => {
  // Extract data from request body
  const { username, email, password } = req.body;
  try {
    const userWithUsername = await getUserByUsername(username);
    const userWithEmail = await getUserByEmail(email);
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
    const password_hash = await bcrypt.hash(password, 10);
    await createUser(username, email, password_hash);
    res.redirect("/login");
  } catch (error) {
    console.log("Error caught: " + error);
    if (error instanceof Error) {
      res.render("register", {
        message: `Error creating user: ${error}`,
      });
    }
  }
});

export default router;
