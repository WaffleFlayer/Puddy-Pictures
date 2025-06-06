import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const WEEKLY_PATH = path.join(process.cwd(), 'weekly-movie.db');
const HISTORY_PATH = path.join(process.cwd(), 'weekly-movie-history.db');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

function checkAdminPassword(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  return password === ADMIN_PASSWORD;
}

// GET: fetch the current weekly movie (public, no password required)
export async function GET(req: NextRequest) {
  try {
    const db = new Database(WEEKLY_PATH);
    const movie = db.prepare('SELECT * FROM weekly_movie ORDER BY id DESC LIMIT 1').get();
    db.close();
    if (!movie) {
      return NextResponse.json({ error: 'No weekly movie set' }, { status: 404 });
    }
    return NextResponse.json(movie);
  } catch (e) {
    return NextResponse.json({ error: 'No weekly movie set' }, { status: 404 });
  }
}

// POST: set the weekly movie (admin/automation, password required)
export async function POST(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const body = await req.json();
    if (!body || !body.code || !body.title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Insert into weekly_movie
    const db = new Database(WEEKLY_PATH);
    db.prepare('DELETE FROM weekly_movie').run();
    db.prepare(`INSERT INTO weekly_movie (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(body.title, body.year, body.country, body.director, body.description, body.watch_info, body.region, body.genre, body.decade, body.budget, body.release_year, body.poster_url, body.code, body.ai_intro);
    db.close();
    // --- Append to history ---
    const dbh = new Database(HISTORY_PATH);
    dbh.prepare(`INSERT INTO weekly_movie_history (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(body.title, body.year, body.country, body.director, body.description, body.watch_info, body.region, body.genre, body.decade, body.budget, body.release_year, body.poster_url, body.code, body.ai_intro, new Date().toISOString());
    // Keep only last 50 entries
    const ids = dbh.prepare('SELECT id FROM weekly_movie_history ORDER BY id DESC LIMIT 50').all();
    if (ids.length === 50) {
      const minId = (ids[ids.length - 1] as any).id;
      dbh.prepare('DELETE FROM weekly_movie_history WHERE id < ?').run(minId);
    }
    dbh.close();
    // ---
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
