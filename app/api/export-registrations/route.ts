import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== ADMIN_PASSWORD) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const db = new Database(path.join(process.cwd(), 'registrations.db'));
  const registrations = db.prepare('SELECT * FROM registrations').all();
  db.close();
  return NextResponse.json(registrations);
}
