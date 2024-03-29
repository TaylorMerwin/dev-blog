import express from 'express';
import session from 'express-session';

import { updateCache } from './services/cacheService';
import postRoutes from './routes/postRoutes';
import homeRoutes from './routes/homeRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

declare module 'express-session' {
  export interface SessionData {
    user: {userId: number; username: string; };
  }
}

const app = express();
const PORT = process.env.PORT || 8080;

updateCache();

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
  secret: 'my_secret_key',
  resave: false,
  saveUninitialized: false,
}));

app.use(postRoutes);
app.use(homeRoutes);
app.use(userRoutes);
app.use(authRoutes);


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});