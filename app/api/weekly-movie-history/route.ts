import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';
import crypto from 'crypto';

const HISTORY_FIELDS = 'id, title, year, country, director, description, watch_info, region, genre, decade, budget, release_year, poster_url, code, ai_intro, timestamp';

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

// GET: fetch the weekly movie history (admin only)
export async function GET(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const { rows } = await pool.query(`SELECT ${HISTORY_FIELDS} FROM weekly_movie_history ORDER BY id DESC`);
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: 'Could not load history' }, { status: 500 });
  }
}
