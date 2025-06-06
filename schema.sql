-- Puddy Pictures: Full PostgreSQL Schema

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  name TEXT,
  displayName TEXT UNIQUE,
  phone TEXT,
  consent BOOLEAN,
  date TEXT,
  unsubscribed BOOLEAN DEFAULT FALSE,
  unsubscribedDate TEXT
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  "from" TEXT,
  "to" TEXT,
  code TEXT,
  review TEXT,
  displayName TEXT,
  raw TEXT,
  timestamp TEXT
);

-- Weekly movie table
CREATE TABLE IF NOT EXISTS weekly_movie (
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
);

-- Weekly movie history table
CREATE TABLE IF NOT EXISTS weekly_movie_history (
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
);
