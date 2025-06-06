import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'; // Set this in your .env file

function checkAdminPassword(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  return password === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const db = new Database(path.join(process.cwd(), 'registrations.db'));
  const registrations = db.prepare('SELECT * FROM registrations').all();
  db.close();
  return NextResponse.json(registrations);
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { phone } = await req.json();
  const db = new Database(path.join(process.cwd(), 'registrations.db'));
  db.prepare('DELETE FROM registrations WHERE phone = ?').run(phone);
  const registrations = db.prepare('SELECT * FROM registrations').all();
  db.close();
  return NextResponse.json({ success: true, registrations });
}
