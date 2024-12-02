import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: true,
  },
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Connected to database successfully");
    client.release();
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

export { pool };
