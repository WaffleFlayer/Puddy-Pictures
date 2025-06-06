// migrate-sqlite-to-postgres-reviews.js
// Script to migrate reviews from SQLite to PostgreSQL

const Database = require('better-sqlite3');
const { Pool } = require('pg');
require('dotenv').config();

const sqliteDb = new Database('reviews.db');
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  // Ensure the table exists in Postgres
  await pool.query(`CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    "from" TEXT,
    "to" TEXT,
    code TEXT,
    review TEXT,
    displayName TEXT,
    raw TEXT,
    timestamp TEXT
  )`);

  const reviews = sqliteDb.prepare('SELECT * FROM reviews').all();
  let count = 0;
  for (const r of reviews) {
    await pool.query(
      `INSERT INTO reviews ("from", "to", code, review, displayName, raw, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING`,
      [
        r.from,
        r.to,
        r.code,
        r.review,
        r.displayName,
        r.raw,
        r.timestamp
      ]
    );
    count++;
  }
  await pool.end();
  sqliteDb.close();
  console.log(`Migrated ${count} reviews to PostgreSQL.`);
}

migrate().catch(e => { console.error(e); process.exit(1); });
