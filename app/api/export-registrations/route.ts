import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/postgres';
import crypto from 'crypto';

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

export async function GET(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { rows } = await pool.query('SELECT * FROM registrations');
  return NextResponse.json(rows);
}
