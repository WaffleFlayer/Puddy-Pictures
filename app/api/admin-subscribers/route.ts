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
  console.log('ADMIN_PASSWORD env:', ADMIN_PASSWORD);
  const password = req.headers.get('x-admin-password');
  console.log('Password from header:', password);
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { rows } = await pool.query('SELECT * FROM registrations');
  return NextResponse.json(rows);
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { phone } = await req.json();
  await pool.query('DELETE FROM registrations WHERE phone = $1', [phone]);
  const { rows } = await pool.query('SELECT * FROM registrations');
  return NextResponse.json({ success: true, registrations: rows });
}
