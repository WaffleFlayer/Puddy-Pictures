import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';

const HISTORY_FIELDS = 'id, title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro, timestamp';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

function checkAdminPassword(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  return password === ADMIN_PASSWORD;
}

// DELETE: remove a movie from history by index
export async function DELETE(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const { index } = await req.json();
    if (typeof index !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid index' }, { status: 400 });
    }
    // Get all ids ordered by DESC
    const { rows: ids } = await pool.query('SELECT id FROM weekly_movie_history ORDER BY id DESC');
    if (index < 0 || index >= ids.length) {
      return NextResponse.json({ error: 'Index out of range' }, { status: 400 });
    }
    const deleteId = ids[index].id;
    await pool.query('DELETE FROM weekly_movie_history WHERE id = $1', [deleteId]);
    // Return updated history
    const { rows: data } = await pool.query(`SELECT ${HISTORY_FIELDS} FROM weekly_movie_history ORDER BY id DESC`);
    return NextResponse.json({ success: true, history: data });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
