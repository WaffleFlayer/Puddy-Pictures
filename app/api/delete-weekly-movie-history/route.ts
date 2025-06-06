import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';
import crypto from 'crypto';

const HISTORY_FIELDS = 'id, title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro, timestamp';

// DELETE: remove a movie from history by index
export async function DELETE(req: NextRequest) {
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
