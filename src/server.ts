import express from "express";
import session from "express-session";
import rateLimit from "express-rate-limit";

import { updateCache } from "./services/cacheService";
import postRoutes from "./routes/postRoutes";
import homeRoutes from "./routes/homeRoutes";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

declare module "express-session" {
  export interface SessionData {
    user: { userId: number; username: string };
  }
}

const app = express();
const PORT = process.env.PORT || 8080;
const SECRET = process.env.SECRET || "my_secret";
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

updateCache();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(limiter);
app.use(postRoutes);
app.use(homeRoutes);
app.use(userRoutes);
app.use(authRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
