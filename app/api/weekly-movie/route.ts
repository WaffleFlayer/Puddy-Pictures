import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
const WEEKLY_MOVIE_FIELDS = 'id, title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro';
const HISTORY_FIELDS = WEEKLY_MOVIE_FIELDS + ', timestamp';

function checkAdminPassword(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  return password === ADMIN_PASSWORD;
}

// GET: fetch the current weekly movie (public, no password required)
export async function GET(req: NextRequest) {
  try {
    const { rows } = await pool.query(`SELECT ${WEEKLY_MOVIE_FIELDS} FROM weekly_movie ORDER BY id DESC LIMIT 1`);
    if (!rows.length) {
      return NextResponse.json({ error: 'No weekly movie set' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
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
    // Insert into weekly_movie (replace all rows)
    await pool.query('DELETE FROM weekly_movie');
    await pool.query(
      `INSERT INTO weekly_movie (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [body.title, body.year, body.country, body.director, body.description, body.watch_info, body.region, body.genre, body.decade, body.budget, body.release_year, body.poster_url, body.code, body.ai_intro]
    );
    // --- Append to history ---
    await pool.query(
      `INSERT INTO weekly_movie_history (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [body.title, body.year, body.country, body.director, body.description, body.watch_info, body.region, body.genre, body.decade, body.budget, body.release_year, body.poster_url, body.code, body.ai_intro, new Date().toISOString()]
    );
    // Keep only last 50 entries
    const { rows: ids } = await pool.query('SELECT id FROM weekly_movie_history ORDER BY id DESC LIMIT 50');
    if (ids.length === 50) {
      const minId = ids[ids.length - 1].id;
      await pool.query('DELETE FROM weekly_movie_history WHERE id < $1', [minId]);
    }
    // ---
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
