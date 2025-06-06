// migrate-sqlite-to-postgres-weekly-movie.js
// Script to migrate weekly movie and history from SQLite to PostgreSQL

const Database = require('better-sqlite3');
const { Pool } = require('pg');
require('dotenv').config();

const weeklyDb = new Database('weekly-movie.db');
const historyDb = new Database('weekly-movie-history.db');
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  // Ensure the tables exist in Postgres
  await pool.query(`CREATE TABLE IF NOT EXISTS weekly_movie (
    id SERIAL PRIMARY KEY,
    title TEXT,
    year TEXT,
    country TEXT,
    director TEXT,
    description TEXT,
    watch_info TEXT,
    region TEXT,
    genre TEXT,
    decade TEXT,
    budget TEXT,
    release_year TEXT,
    poster_url TEXT,
    code TEXT,
    ai_intro TEXT
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS weekly_movie_history (
    id SERIAL PRIMARY KEY,
    title TEXT,
    year TEXT,
    country TEXT,
    director TEXT,
    description TEXT,
    watch_info TEXT,
    region TEXT,
    genre TEXT,
    decade TEXT,
    budget TEXT,
    release_year TEXT,
    poster_url TEXT,
    code TEXT,
    ai_intro TEXT,
    timestamp TEXT
  )`);

  // Migrate current weekly movie (replace all rows)
  const movies = weeklyDb.prepare('SELECT * FROM weekly_movie').all();
  await pool.query('DELETE FROM weekly_movie');
  let count = 0;
  for (const m of movies) {
    await pool.query(
      `INSERT INTO weekly_movie (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        m.title, m.year, m.country, m.director, m.description, m.watch_info, m.region, m.genre, m.decade, m.budget, m.release_year, m.poster_url, m.code, m.ai_intro
      ]
    );
    count++;
  }

  // Migrate weekly movie history
  const history = historyDb.prepare('SELECT * FROM weekly_movie_history').all();
  let hcount = 0;
  for (const h of history) {
    await pool.query(
      `INSERT INTO weekly_movie_history (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        h.title, h.year, h.country, h.director, h.description, h.watch_info, h.region, h.genre, h.decade, h.budget, h.release_year, h.poster_url, h.code, h.ai_intro, h.timestamp
      ]
    );
    hcount++;
  }

  await pool.end();
  weeklyDb.close();
  historyDb.close();
  console.log(`Migrated ${count} weekly movie(s) and ${hcount} history entries to PostgreSQL.`);
}

migrate().catch(e => { console.error(e); process.exit(1); });
