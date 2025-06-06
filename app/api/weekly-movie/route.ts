import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';
import crypto from 'crypto';
import twilio from 'twilio';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function checkAdminPassword(req: NextRequest) {
  const password = req.headers.get('x-admin-password') || '';
  return ADMIN_PASSWORD.length > 0 && timingSafeEqual(password, ADMIN_PASSWORD);
}

const WEEKLY_MOVIE_FIELDS = 'id, title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro';
const HISTORY_FIELDS = WEEKLY_MOVIE_FIELDS + ', timestamp';

// Helper to generate SMS preview (copied from admin page)
function getSMSPreview(movie: any, intro: string) {
  const wittyIntro = movie.ai_intro || intro || '';
  return `${wittyIntro}\n\n` +
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
}

// GET: fetch the current weekly movie (public, no password required)
export async function GET(req: NextRequest) {
  try {
    const { rows } = await pool.query(`SELECT ${WEEKLY_MOVIE_FIELDS} FROM weekly_movie ORDER BY id DESC LIMIT 1`);
    if (!rows.length) {
      return NextResponse.json({ error: 'No weekly movie set' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: 'No weekly movie set' }, { status: 404 });
  }
}

// POST: set the weekly movie (admin/automation, password required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.code || !body.title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Insert into weekly_movie (replace all rows)
    await pool.query('DELETE FROM weekly_movie');
    await pool.query(
      `INSERT INTO weekly_movie (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [body.title, body.year, body.country, body.director, body.description, body.watch_info, body.region, body.genre, body.decade, body.budget, body.release_year, body.poster_url, body.code, body.ai_intro]
    );
    // --- Append to history ---
    await pool.query(
      `INSERT INTO weekly_movie_history (title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [body.title, body.year, body.country, body.director, body.description, body.watch_info, body.region, body.genre, body.decade, body.budget, body.release_year, body.poster_url, body.code, body.ai_intro, new Date().toISOString()]
    );
    // Keep only last 50 entries
    const { rows: ids } = await pool.query('SELECT id FROM weekly_movie_history ORDER BY id DESC LIMIT 50');
    if (ids.length === 50) {
      const minId = ids[ids.length - 1].id;
      await pool.query('DELETE FROM weekly_movie_history WHERE id < $1', [minId]);
    }
    // --- Send SMS to all active subscribers ---
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    if (accountSid && authToken && fromNumber) {
      const client = twilio(accountSid, authToken);
      const { rows: registrations } = await pool.query('SELECT phone FROM registrations WHERE unsubscribed = false OR unsubscribed IS NULL');
      // Use the same preview logic as the admin page
      const smsText = getSMSPreview(body, body.ai_intro || '');
      for (const sub of registrations) {
        if (!sub.phone) continue;
        try {
          await client.messages.create({
            body: smsText,
            from: fromNumber,
            to: sub.phone,
            mediaUrl: body.poster_url ? [body.poster_url] : undefined
          });
        } catch (err) {
          // Log but do not fail the request
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`Failed to send to ${sub.phone}:`, errorMsg);
        }
      }
    }
    // ---
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
