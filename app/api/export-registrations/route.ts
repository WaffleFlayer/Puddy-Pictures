import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';

export async function GET(req: NextRequest) {
  const { rows } = await pool.query('SELECT * FROM registrations');
  return NextResponse.json(rows);
}
