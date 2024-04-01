import { User } from "../interfaces/types";
import { pool } from "./database";

// Returns a user entry from the Users table by username
export async function getUserByUsername(username: string) {
  const query = `
  SELECT * 
  FROM Users
  WHERE username = $1`;
  const result = await pool.query(query, [username]);
  const rows = result.rows;
  return rows[0] as User;
}

/**
 * Insert a new user into the Users table
 * @param username
 * @param email
 * @param passwordHash
 * @returns confirmation message
 */
export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
) {
  const query = `
  INSERT INTO Users (username, email, password_hash)
  VALUES ($1, $2, $3)`;
  await pool.query(query, [username, email, passwordHash]);
  return { message: "User created successfully" };
}
