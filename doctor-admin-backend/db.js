import { Pool } from 'pg';
require('dotenv').config();

// Create a new pool using the connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Only for development, use proper SSL in production
  }
});

// Export the pool for use in other modules
export function query(text, params) { return pool.query(text, params); }
export function connect() { return pool.connect(); }
