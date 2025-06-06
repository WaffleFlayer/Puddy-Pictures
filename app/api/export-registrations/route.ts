import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAdminPassword(req: NextRequest) {
  // Only allow access if the password matches exactly and is not empty/null
  const password = req.headers.get('x-admin-password');
  return Boolean(ADMIN_PASSWORD) && password === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { rows } = await pool.query('SELECT * FROM registrations');
  return NextResponse.json(rows);
}
