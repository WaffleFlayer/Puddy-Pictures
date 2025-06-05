import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const HISTORY_PATH = path.join(process.cwd(), 'weekly-movie-history.json');
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
    let history = [];
    if (fs.existsSync(HISTORY_PATH)) {
      try {
        history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
      } catch {}
    }
    if (index < 0 || index >= history.length) {
      return NextResponse.json({ error: 'Index out of range' }, { status: 400 });
    }
    history.splice(index, 1);
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
    return NextResponse.json({ success: true, history });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
