import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REVIEWS_PATH = path.join(process.cwd(), 'reviews.json');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
  }
  let reviews: any[] = [];
  try {
    const file = fs.readFileSync(REVIEWS_PATH, 'utf-8');
    reviews = JSON.parse(file);
  } catch (e) {
    reviews = [];
  }
  // Filter reviews by code (case-insensitive)
  const filtered = reviews.filter(r => r.code && r.code.toUpperCase() === code.toUpperCase());
  return NextResponse.json(filtered);
}
