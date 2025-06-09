import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';

// GET: Return all reviews (admin)
export async function GET() {
  const { rows } = await pool.query('SELECT * FROM reviews ORDER BY timestamp DESC');
  // Normalize displayName
  const reviews = rows.map(r => ({ ...r, displayName: r.displayName || r.displayname || undefined }));
  return NextResponse.json(reviews);
}

// DELETE: Remove a review by id (admin)
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
