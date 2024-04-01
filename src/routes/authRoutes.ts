import express from "express";
import bcrypt from "bcrypt";
import { createUser, getUserByUsername } from "../models/userModel";

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
    return res.status(400).send("Username and password are required.");
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
router.post("/registerAction/", async (req, res) => {
  // Extract data from request body
  const { username, email, password } = req.body;
  try {
    if (!username || !password) {
      // Handle missing username or password appropriately
      return res.status(400).send("Username and password are required.");
    }
    const user = await getUserByUsername(username);
    // User already exists
    if (user) {
      res.send("Username already taken.");
    } else if (password.length < 8) {
      res.send("Password must be at least 8 characters.");
    }
    // Ensure valid email format
    else if (!email.includes("@")) {
      res.send("Invalid email.");
    }
    // basic validation good, continue
    else {
      // Hash the password
      const password_hash = await bcrypt.hash(password, 10);

      await createUser(username, email, password_hash);
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).send(`Error creating user, ${error}`);
  }
});

export default router;
