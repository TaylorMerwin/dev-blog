import { Request, Response, NextFunction } from "express";

export const validateRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, email, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }
  if (password.length < 8) {
    return res.send("Password must be at least 8 characters.");
  }
  if (!email.includes("@")) {
    return res.send("Invalid email.");
  }
  next();
};
