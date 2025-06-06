import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';

const HISTORY_FIELDS = 'id, title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro, timestamp';

// GET: fetch the weekly movie history (admin only)
export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
  if (password !== ADMIN_PASSWORD) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const { rows } = await pool.query(`SELECT ${HISTORY_FIELDS} FROM weekly_movie_history ORDER BY id DESC`);
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: 'Could not load history' }, { status: 500 });
  }
}
