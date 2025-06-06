import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TEMPORARY: Expose the admin password env variable for debugging
  return NextResponse.json({ adminPassword: process.env.ADMIN_PASSWORD });
}
