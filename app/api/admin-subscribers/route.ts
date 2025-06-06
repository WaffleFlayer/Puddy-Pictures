import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'; // Set this in your .env file

function checkAdminPassword(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  return password === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { rows } = await pool.query('SELECT * FROM registrations');
  return NextResponse.json(rows);
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { phone } = await req.json();
  await pool.query('DELETE FROM registrations WHERE phone = $1', [phone]);
  const { rows } = await pool.query('SELECT * FROM registrations');
  return NextResponse.json({ success: true, registrations: rows });
}
