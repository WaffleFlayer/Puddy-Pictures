import pool from '../../../utils/postgres';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const from = data.get('From') as string | null;
    const body = data.get('Body') as string | null;
    const to = data.get('To') as string | null;
    const timestamp = new Date().toISOString();

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract code and review
    const match = body.trim().match(/^(\w{6})\s+(.*)$/);
    const code = match ? match[1].toUpperCase() : null;
    const review = match ? match[2].trim() : body.trim();

    // Find displayName for this phone number
    let displayName = undefined;
    const { rows: regRows } = await pool.query('SELECT displayName FROM registrations WHERE REPLACE(REPLACE(phone, \'-\', \'\'), \'(\', \'\') = $1 LIMIT 1', [from.replace(/\D/g, '').replace(/^1/, '')]);
    if (regRows.length > 0 && regRows[0].displayname) displayName = regRows[0].displayname;

    // Check for STOP opt-out
    if (body.trim().toUpperCase() === 'STOP') {
      // Mark user as unsubscribed in registrations
      await pool.query('UPDATE registrations SET unsubscribed = 1, unsubscribedDate = $1 WHERE REPLACE(REPLACE(phone, \'-\', \'\'), \'(\', \'\') = $2', [new Date().toISOString(), from.replace(/\D/g, '').replace(/^1/, '')]);
      // Remove all reviews from this user
      await pool.query('DELETE FROM reviews WHERE REPLACE(REPLACE("from", \'-\', \'\'), \'(\', \'\') = $1', [from.replace(/\D/g, '').replace(/^1/, '')]);
      return new NextResponse('You have been unsubscribed from Puddy Pictures Movie Club.', { status: 200 });
    }

    // Add new review
    await pool.query(
      'INSERT INTO reviews ("from", "to", code, review, displayName, raw, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [from, to, code, review, displayName, body, timestamp]
    );

    // Respond with success (Twilio expects a 200 OK)
    return new NextResponse('Review received. Thank you!', { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
