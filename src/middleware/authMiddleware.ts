import { Request, Response, NextFunction } from "express";

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.session.user) {
    next(); // The user is logged in, proceed to the route handler
  } else {
    res.redirect("/login");
  }
}
