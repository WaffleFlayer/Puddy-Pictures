import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
  }
  // Query reviews.db for reviews matching the code
  const db = new Database(path.join(process.cwd(), 'reviews.db'));
  const reviews = db.prepare('SELECT * FROM reviews WHERE code = ? COLLATE NOCASE').all(code);
  db.close();
  return NextResponse.json(reviews);
}
