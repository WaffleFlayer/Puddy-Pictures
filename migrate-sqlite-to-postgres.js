// migrate-sqlite-to-postgres.js
// Script to migrate registrations from SQLite to PostgreSQL

const Database = require('better-sqlite3');
const { Pool } = require('pg');
require('dotenv').config();

const sqliteDb = new Database('registrations.db');
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  // Ensure the table exists in Postgres
  await pool.query(`CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    name TEXT,
    displayName TEXT UNIQUE,
    phone TEXT,
    consent BOOLEAN,
    date TEXT,
    unsubscribed BOOLEAN DEFAULT FALSE,
    unsubscribedDate TEXT
  )`);

  const registrations = sqliteDb.prepare('SELECT * FROM registrations').all();
  let count = 0;
  for (const r of registrations) {
    // Upsert by phone number
    await pool.query(
      `INSERT INTO registrations (name, displayName, phone, consent, date, unsubscribed, unsubscribedDate)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (displayName) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         consent = EXCLUDED.consent,
         date = EXCLUDED.date,
         unsubscribed = EXCLUDED.unsubscribed,
         unsubscribedDate = EXCLUDED.unsubscribedDate`,
      [
        r.name,
        r.displayName,
        r.phone,
        !!r.consent,
        r.date,
        !!r.unsubscribed,
        r.unsubscribedDate || null
      ]
    );
    count++;
  }
  await pool.end();
  sqliteDb.close();
  console.log(`Migrated ${count} registrations to PostgreSQL.`);
}

migrate().catch(e => { console.error(e); process.exit(1); });
