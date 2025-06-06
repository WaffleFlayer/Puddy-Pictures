// send-weekly-movie.js
// Script to send the weekly movie MMS to all subscribers using Twilio

const fs = require('fs');
const path = require('path');
const twilio = require('twilio');

// Load .env variables
require('dotenv').config();

// Load environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
if (!accountSid || !authToken || !fromNumber) {
  console.error('Missing Twilio environment variables.');
  process.exit(1);
}
const client = twilio(accountSid, authToken);

// --- PostgreSQL integration ---
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getSchedule() {
  const res = await pool.query('SELECT * FROM weekly_movie_schedule ORDER BY updated_at DESC LIMIT 1');
  if (res.rows.length === 0) {
    return { day_of_week: 'Friday', time_of_day: '18:00', frequency: 'Weekly' };
  }
  return res.rows[0];
}

async function getAllSubscribers() {
  const res = await pool.query('SELECT * FROM registrations WHERE unsubscribed = false');
  return res.rows;
}

async function setWeeklyMovie(movie) {
  await pool.query('INSERT INTO weekly_movie (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
    [movie.title, movie.year, movie.country, movie.director, movie.description, movie.watch_info, movie.region, movie.genre, movie.decade, movie.budget, movie.release_year, movie.poster_url, movie.code, movie.ai_intro]);
}

// --- Replace getRandomMovie with rollNewRandomMovie ---
async function rollNewRandomMovie() {
  // Use the same logic as the admin UI's runSequence
  // 1. Randomly select for each wheel
  const wheels = {
    region: ["North America", "Europe", "Asia", "Latin America", "Africa", "Oceania"],
    genre: ["Drama", "Comedy", "Horror", "Action", "Sci-Fi", "Romance", "Thriller", "Animation", "Documentary"],
    decade: ["1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"],
    budget: ["Micro-budget", "Indie", "Studio", "Blockbuster"]
  };
  const order = ["region", "genre", "decade", "budget"];
  let selections = {};
  for (const type of order) {
    const options = wheels[type];
    selections[type] = options[Math.floor(Math.random() * options.length)];
  }
  // 2. Call the same API as the admin UI to generate a movie
  const res = await fetch('http://localhost:3000/api/generate-movie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(selections)
  });
  if (!res.ok) throw new Error('Failed to generate movie');
  const raw = await res.json();
  // 3. Generate code
  function generateMovieCode(title, year) {
    let processedTitle = (title || "").trim();
    if (/^the\s+/i.test(processedTitle)) {
      processedTitle = processedTitle.replace(/^the\s+/i, '');
    }
    let clean = processedTitle.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const banned = ["ASS", "NIG", "FAG", "CUM", "SEX", "DIE", "FUK", "FUC", "TIT", "PIS", "PUS", "DIC", "COC", "COK", "JIZ", "GAY", "RAP", "SUC", "SUK", "FAP", "FAG", "FCK", "FUC", "FUK", "FUX", "XXX"];
    let prefix = clean.slice(0, 3);
    let code;
    let attempts = 0;
    do {
      prefix = clean.slice(0, 3);
      if (banned.includes(prefix)) {
        clean = clean.length > 3 ? clean.slice(1) : Math.random().toString(36).substring(2, 5).toUpperCase();
      }
      code = (prefix + (year ? year.slice(-2) : "00") + Math.floor(Math.random() * 10)).padEnd(6, 'X');
      attempts++;
    } while (banned.includes(prefix) && attempts < 10);
    return code;
  }
  const movieCode = generateMovieCode(raw.title, raw.release_year);
  return { ...raw, code: movieCode };
}

// Helper to generate SMS preview (copied from web app)
function getSMSPreview(movie, intro) {
  const wittyIntro = movie.ai_intro || intro || '';
  return `${wittyIntro}\n\n` +
    `Title: ${movie.title}\n` +
    `Year: ${movie.release_year}\n` +
    `Description: ${movie.description}\n` +
    `Director: ${movie.director}\n` +
    `Country: ${movie.country}\n` +
    `Genre: ${movie.genre}\n` +
    `Budget: ${movie.budget}\n` +
    `Where to watch: ${movie.watch_info}\n` +
    `Review code: ${movie.code}\n` +
    `Reply to the club SMS with this code at the start of your review!`;
}

// Helper to fetch witty intro from API
async function fetchWittyIntro(movie) {
  try {
    const res = await fetch('http://localhost:3000/api/ai-witty-intro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movie })
    });
    if (res.ok) {
      const data = await res.json();
      return data.intro || '';
    }
  } catch {}
  return '';
}

// --- Replace main() message logic ---
async function main() {
  const schedule = await getSchedule();
  console.log('Current schedule:', schedule);

  // 2. Roll a new random movie using the same logic as the admin UI
  const movie = await rollNewRandomMovie();
  if (!movie) {
    console.error('Failed to roll a new random movie.');
    process.exit(1);
  }
  // 3. Set as weekly movie
  await setWeeklyMovie(movie);

  // 4. Fetch witty intro and format SMS like the web app
  const aiIntro = await fetchWittyIntro(movie);
  const message = getSMSPreview(movie, aiIntro);

  // 5. Get all subscribers
  const registrations = await getAllSubscribers();

  // 6. Send SMS to all
  for (const sub of registrations) {
    if (!sub.phone) continue;
    try {
      const msg = await client.messages.create({
        body: message,
        from: fromNumber,
        to: sub.phone,
        mediaUrl: movie.poster_url ? [movie.poster_url] : undefined
      });
      console.log(`Sent to ${sub.phone}: ${msg.sid}`);
    } catch (err) {
      console.error(`Failed to send to ${sub.phone}:`, err.message);
    }
  }
  await pool.end();
}

main();
