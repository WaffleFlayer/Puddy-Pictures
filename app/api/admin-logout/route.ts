import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Clear the admin_auth cookie
  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_auth', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
  return res;
}
