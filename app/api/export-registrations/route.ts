import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== ADMIN_PASSWORD) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { rows } = await pool.query('SELECT * FROM registrations');
  return NextResponse.json(rows);
}
