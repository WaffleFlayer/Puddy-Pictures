import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (password && adminPassword && password === adminPassword) {
    // Set a secure cookie for admin authentication
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_auth', password, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8 // 8 hours
    });
    return res;
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
