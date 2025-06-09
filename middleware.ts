import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PATHS = [
  '/admin',
  '/admin/',
  '/admin-subscribers',
  '/admin-subscribers/',
  '/admin-reviews',
  '/admin-reviews/',
  '/weekly-movie-page',
  '/weekly-movie-page/',
  '/export-registrations',
  '/export-registrations/'
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Only protect admin pages
  if (ADMIN_PATHS.some((p) => pathname === p)) {
    const cookie = req.cookies.get('admin_auth');
    if (!cookie || cookie.value !== process.env.ADMIN_PASSWORD) {
      const loginUrl = new URL('/admin-login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/',
    '/admin-subscribers',
    '/admin-subscribers/',
    '/admin-reviews',
    '/admin-reviews/',
    '/weekly-movie-page',
    '/weekly-movie-page/',
    '/export-registrations',
    '/export-registrations/'
  ]
};
