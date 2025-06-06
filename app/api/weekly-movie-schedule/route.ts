import { NextRequest, NextResponse } from 'next/server';
import pool from '@/utils/postgres';

// GET: fetch current schedule
export async function GET() {
  const { rows } = await pool.query('SELECT * FROM weekly_movie_schedule ORDER BY updated_at DESC LIMIT 1');
  if (rows.length === 0) {
    return NextResponse.json({ day_of_week: 'Friday', time_of_day: '18:00', frequency: 'Weekly' });
  }
  return NextResponse.json(rows[0]);
}

// POST: update schedule
export async function POST(req: NextRequest) {
  const { day_of_week, time_of_day, frequency } = await req.json();
  await pool.query(
    `INSERT INTO weekly_movie_schedule (day_of_week, time_of_day, frequency, updated_at)
     VALUES ($1, $2, $3, NOW())`,
    [day_of_week, time_of_day, frequency]
  );
  return NextResponse.json({ success: true });
}
