"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPosts = exports.getPost = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = mysql2_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
}).promise();
async function getPost(postID) {
    const [row] = await pool.query(`
  SELECT *
  FROM BlogPosts
  WHERE post_id = ?`, [postID]);
    return [row];
}
exports.getPost = getPost;
async function getPosts() {
    const [rows] = await pool.query(`
  SELECT * FROM BlogPosts`);
    return rows;
}
exports.getPosts = getPosts;
