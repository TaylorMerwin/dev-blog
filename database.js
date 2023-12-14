/*
TODO: Add the database envirnoment variables to the .env file.
*/


import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
}).promise();

/**
 * Retrieves all users from the database.
 * @return {Promise<Array>} all rows from the Users table.
 */
export async function getUsers() {
  const [rows] = await pool.query('SELECT * FROM Users');
  return rows;
}
