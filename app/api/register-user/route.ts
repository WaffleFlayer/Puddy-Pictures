import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import dotenv from 'dotenv';
import pool from '../../../utils/postgres';

dotenv.config();

export async function GET(req: NextRequest) {
  // Check if displayName is taken
  const { searchParams } = new URL(req.url);
  const displayName = searchParams.get('displayName');
  if (displayName) {
    const { rows } = await pool.query('SELECT 1 FROM registrations WHERE LOWER(displayName) = $1 LIMIT 1', [displayName.trim().toLowerCase()]);
    return NextResponse.json({ taken: rows.length > 0 });
  }
  return NextResponse.json({});
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get('name');
  const displayName = formData.get('displayName');
  const phone = formData.get('phone');
  const consent = formData.get('consent');

  if (!consent) {
    return NextResponse.json({ error: 'Consent required to register.' }, { status: 400 });
  }

  // Check for duplicate displayName
  const displayNameStr = typeof displayName === 'string' ? displayName : '';
  const { rows: existsRows } = await pool.query('SELECT 1 FROM registrations WHERE LOWER(displayName) = $1 LIMIT 1', [displayNameStr.trim().toLowerCase()]);
  if (displayNameStr && existsRows.length > 0) {
    return NextResponse.json({ error: 'Display name already taken.' }, { status: 400 });
  }

  await pool.query(
    'INSERT INTO registrations (name, displayName, phone, consent, date, unsubscribed) VALUES ($1, $2, $3, $4, $5, $6)',
    [name, displayNameStr, phone, true, new Date().toISOString(), 0]
  );

  // Send welcome text via Twilio
  if (typeof phone === 'string' && phone.trim()) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (accountSid && authToken && fromNumber) {
        const client = twilio(accountSid, authToken);
        // Send welcome SMS
        await client.messages.create({
          body: `Welcome to Puddy Pictures Movie Club! 🎬\nYou are now subscribed for weekly movie picks and reviews. Reply STOP to unsubscribe at any time.`,
          from: fromNumber,
          to: phone
        });
        // Fetch current weekly movie
        const movieRes = await pool.query('SELECT * FROM weekly_movie ORDER BY id DESC LIMIT 1');
        if (movieRes.rows.length > 0) {
          const movie = movieRes.rows[0];
          // Use the same SMS preview as the weekly broadcast
          const wittyIntro = movie.ai_intro || '';
          const smsText = `${wittyIntro}\n\n` +
            `Title: ${movie.title}\n` +
            `Year: ${movie.release_year}\n` +
            `Description: ${movie.description}\n` +
            `Director: ${movie.director}\n` +
            `Country: ${movie.country}\n` +
            `Genre: ${movie.genre}\n` +
            `Budget: ${movie.budget}\n` +
            `Where to watch: ${movie.watch_info}\n` +
            `Review code: ${movie.code}\n` +
            `Reply to the club SMS with this code at the start of your review!`;
          await client.messages.create({
            body: smsText,
            from: fromNumber,
            to: phone,
            mediaUrl: movie.poster_url ? [movie.poster_url] : undefined
          });
        }
      }
    } catch (err) {
      // Log Twilio errors but don't block registration
      if (err instanceof Error) {
        console.error('Twilio welcome SMS error:', err.message);
      } else {
        console.error('Twilio welcome SMS error:', err);
      }
    }
  }

  return NextResponse.json({ success: true });
}
