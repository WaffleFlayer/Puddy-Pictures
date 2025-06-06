import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const HISTORY_PATH = path.join(process.cwd(), 'weekly-movie-history.db');

// GET: fetch the weekly movie history (admin only)
export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
  if (password !== ADMIN_PASSWORD) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const db = new Database(HISTORY_PATH);
    const data = db.prepare('SELECT * FROM weekly_movie_history ORDER BY id DESC').all();
    db.close();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Could not load history' }, { status: 500 });
  }
}
