import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const HISTORY_PATH = path.join(process.cwd(), 'weekly-movie-history.db');
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
    const db = new Database(HISTORY_PATH);
    // Get all ids ordered by DESC
    const ids = db.prepare('SELECT id FROM weekly_movie_history ORDER BY id DESC').all();
    if (index < 0 || index >= ids.length) {
      db.close();
      return NextResponse.json({ error: 'Index out of range' }, { status: 400 });
    }
    const deleteId = (ids[index] as any).id;
    db.prepare('DELETE FROM weekly_movie_history WHERE id = ?').run(deleteId);
    // Return updated history
    const data = db.prepare('SELECT * FROM weekly_movie_history ORDER BY id DESC').all();
    db.close();
    return NextResponse.json({ success: true, history: data });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
