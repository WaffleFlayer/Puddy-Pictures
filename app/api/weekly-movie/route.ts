import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const WEEKLY_PATH = path.join(process.cwd(), 'weekly-movie.json');

// GET: fetch the current weekly movie
export async function GET() {
  try {
    const file = fs.readFileSync(WEEKLY_PATH, 'utf-8');
    const data = JSON.parse(file);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'No weekly movie set' }, { status: 404 });
  }
}

// POST: set the weekly movie (admin/automation)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Should include: title, release_year, description, director, country, genre, budget, watch_info, poster_url, code
    if (!body || !body.code || !body.title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    fs.writeFileSync(WEEKLY_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
