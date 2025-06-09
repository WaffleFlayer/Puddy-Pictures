import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
  }
  const { rows } = await pool.query('SELECT * FROM reviews WHERE code = $1 COLLATE "C"', [code]);
  // Always return displayName as 'displayName' (not 'displayname')
  const reviews = rows.map(r => ({
    ...r,
    displayName: r.displayName || r.displayname || undefined
  }));
  return NextResponse.json(reviews);
}
