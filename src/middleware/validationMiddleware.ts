import { Request, Response, NextFunction } from "express";

const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]\\|:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_\-+={}[\]\\|:;"'<>,.?/~`]{8,}$/;

export const validateUsername = (username: string): string | null => {
  if (!usernameRegex.test(username)) {
    return "Username must be between 3 and 16 characters long and can only contain letters, numbers, underscores and hyphens.";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!passwordRegex.test(password)) {
    return "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.";
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email.includes("@")) {
    return "Invalid email.";
  }
  return null;
};

export const validateRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, email, password } = req.body;

  let errorMessage = "";
  if (!username || !password) {
    errorMessage = "Username and password are required.";
  }
  const usernameError = validateUsername(username);
  if (usernameError) {
    errorMessage = usernameError;
  }

  const emailError = validateEmail(email);
  if (emailError) {
    errorMessage = emailError;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errorMessage = passwordError;
  }

  if (errorMessage.length > 0) {
    return res.render("register", { message: errorMessage, username, email });
  }
  next();
};
