import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const HISTORY_PATH = path.join(process.cwd(), 'weekly-movie-history.json');

// GET: fetch the weekly movie history (admin only)
export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
  if (password !== ADMIN_PASSWORD) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    if (!fs.existsSync(HISTORY_PATH)) {
      return NextResponse.json([]);
    }
    const file = fs.readFileSync(HISTORY_PATH, 'utf-8');
    const data = JSON.parse(file);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Could not load history' }, { status: 500 });
  }
}
