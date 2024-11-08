// src/db.ts
import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 15432,
  database: "ragdemo",
});

// Initialize the database with required extensions and tables
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Enable vector extension
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");

    // Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        embedding vector(1536),
        taskId TEXT,
        epicId TEXT
      )`);
  } finally {
    client.release();
  }
}

export async function resetDatabase() {
  const client = await pool.connect();
  // don't do this in production
  await client.query("DROP TABLE IF EXISTS documents");
  await client.query("DROP EXTENSION IF EXISTS vector");
}