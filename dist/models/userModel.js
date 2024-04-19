"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUserByEmail = exports.getUserByUsername = void 0;
const database_1 = require("./database");
// Returns a user entry from the Users table by username
async function getUserByUsername(username) {
    const query = `
  SELECT * 
  FROM Users
  WHERE username = $1`;
    const result = await database_1.pool.query(query, [username]);
    const rows = result.rows;
    return rows[0];
}
exports.getUserByUsername = getUserByUsername;
async function getUserByEmail(email) {
    const query = `
  SELECT * 
  FROM Users
  WHERE email = $1`;
    const result = await database_1.pool.query(query, [email]);
    const rows = result.rows;
    return rows[0];
}
exports.getUserByEmail = getUserByEmail;
/**
 * Insert a new user into the Users table
 * @param username
 * @param email
 * @param passwordHash
 * @returns confirmation message
 */
async function createUser(username, email, passwordHash) {
    const query = `
  INSERT INTO Users (username, email, password_hash)
  VALUES ($1, $2, $3)`;
    await database_1.pool.query(query, [username, email, passwordHash]);
    return { message: "User created successfully" };
}
exports.createUser = createUser;
