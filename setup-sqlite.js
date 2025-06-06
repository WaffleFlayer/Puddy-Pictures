// SQLite database setup for registrations
// This script creates the registrations table if it doesn't exist

const Database = require('better-sqlite3');
const db = new Database('registrations.db');

db.prepare(`CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  displayName TEXT UNIQUE,
  phone TEXT,
  consent INTEGER,
  date TEXT,
  unsubscribed INTEGER DEFAULT 0
)`).run();

db.close();

console.log('registrations.db and table are ready.');

// Create reviews table
const db2 = new Database('reviews.db');
db2.prepare(`CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  "from" TEXT,
  "to" TEXT,
  code TEXT,
  review TEXT,
  displayName TEXT,
  raw TEXT,
  timestamp TEXT
)`).run();
db2.close();

// Create weekly movie table
const db3 = new Database('weekly-movie.db');
db3.prepare(`CREATE TABLE IF NOT EXISTS weekly_movie (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
)`).run();

db3.close();

// Create weekly movie history table
const db4 = new Database('weekly-movie-history.db');
db4.prepare(`CREATE TABLE IF NOT EXISTS weekly_movie_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
)`).run();
db4.close();
