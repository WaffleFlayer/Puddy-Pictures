// migrate-json-to-sqlite.js
// Script to import data from JSON files into SQLite databases

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// --- Reviews ---
const reviewsPath = path.join(__dirname, 'reviews.json');
if (fs.existsSync(reviewsPath)) {
  const db = new Database('reviews.db');
  const reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));
  // Quote reserved words in SQL ("from", "to")
  const insert = db.prepare(`INSERT INTO reviews ("from", "to", code, review, displayName, raw, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  let count = 0;
  for (const r of reviews) {
    insert.run(r.from, r.to, r.code, r.review, r.displayName, r.raw, r.timestamp);
    count++;
  }
  db.close();
  console.log(`Imported ${count} reviews.`);
}

// --- Weekly Movie ---
const weeklyMoviePath = path.join(__dirname, 'weekly-movie.json');
if (fs.existsSync(weeklyMoviePath)) {
  const db = new Database('weekly-movie.db');
  const movie = JSON.parse(fs.readFileSync(weeklyMoviePath, 'utf-8'));
  // Remove all old entries
  db.prepare('DELETE FROM weekly_movie').run();
  db.prepare(`INSERT INTO weekly_movie (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      movie.title, movie.year, movie.country, movie.director, movie.description, movie.watch_info, movie.region, movie.genre, movie.decade, movie.budget, movie.release_year, movie.poster_url, movie.code, movie.ai_intro
    );
  db.close();
  console.log('Imported current weekly movie.');
}

// --- Weekly Movie History ---
const historyPath = path.join(__dirname, 'weekly-movie-history.json');
if (fs.existsSync(historyPath)) {
  const db = new Database('weekly-movie-history.db');
  const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  const insert = db.prepare(`INSERT INTO weekly_movie_history (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  let count = 0;
  for (const m of history) {
    insert.run(m.title, m.year, m.country, m.director, m.description, m.watch_info, m.region, m.genre, m.decade, m.budget, m.release_year, m.poster_url, m.code, m.ai_intro, m.timestamp);
    count++;
  }
  db.close();
  console.log(`Imported ${count} weekly movie history entries.`);
}

console.log('Migration complete.');
