import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to store reviews (JSON file for simplicity)
const REVIEWS_PATH = path.join(process.cwd(), 'reviews.json');

// Helper: extract code (first word, 6 chars) and review text
function extractCodeAndReview(body: string) {
  // Remove the 's' flag for compatibility
  const match = body.trim().match(/^(\w{6})\s+(.*)$/);
  if (match) {
    return { code: match[1].toUpperCase(), review: match[2].trim() };
  }
  return { code: null, review: body.trim() };
}

export async function POST(req: NextRequest) {
  try {
    // Parse incoming SMS webhook (e.g., from Twilio)
    const data = await req.formData();
    const from = data.get('From') as string | null;
    const body = data.get('Body') as string | null;
    const to = data.get('To') as string | null;
    const timestamp = new Date().toISOString();

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract code and review
    const { code, review } = extractCodeAndReview(body);

    // Load existing reviews
    let reviews: any[] = [];
    try {
      const file = fs.readFileSync(REVIEWS_PATH, 'utf-8');
      reviews = JSON.parse(file);
    } catch (e) {
      reviews = [];
    }

    // Add new review
    reviews.push({ from, to, code, review, raw: body, timestamp });
    fs.writeFileSync(REVIEWS_PATH, JSON.stringify(reviews, null, 2));

    // Respond with success (Twilio expects a 200 OK)
    return new NextResponse('Review received. Thank you!', { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
