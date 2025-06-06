import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';

export async function GET(req: NextRequest) {
  const { rows } = await pool.query('SELECT * FROM registrations');
  return NextResponse.json(rows);
}

export async function DELETE(req: NextRequest) {
  const { phone } = await req.json();
  await pool.query('DELETE FROM registrations WHERE phone = $1', [phone]);
  const { rows } = await pool.query('SELECT * FROM registrations');
  return NextResponse.json({ success: true, registrations: rows });
}
