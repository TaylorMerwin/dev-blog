import { Request, Response, NextFunction } from "express";

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.session.user) {
    next(); // The user is logged in, proceed to the route handler
  } else {
    // User is not logged in, send an error message or redirect to login
    res.status(401).send("Please log in to view this page.");
    // Or redirect to login page: res.redirect('/login');
  }
}
