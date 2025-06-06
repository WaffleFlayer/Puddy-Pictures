import Database from 'better-sqlite3';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const from = data.get('From') as string | null;
    const body = data.get('Body') as string | null;
    const to = data.get('To') as string | null;
    const timestamp = new Date().toISOString();

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract code and review
    const match = body.trim().match(/^(\w{6})\s+(.*)$/);
    const code = match ? match[1].toUpperCase() : null;
    const review = match ? match[2].trim() : body.trim();

    // Find displayName for this phone number
    let displayName = undefined;
    const regDb = new Database(path.join(process.cwd(), 'registrations.db'));
    const reg = regDb.prepare('SELECT displayName FROM registrations WHERE REPLACE(REPLACE(phone, \'-\', \'\'), \'(\', \'\') = ? LIMIT 1')
      .get(from.replace(/\D/g, '').replace(/^1/, ''));
    if (reg && typeof reg === 'object' && 'displayName' in reg) displayName = (reg as any).displayName;
    regDb.close();

    // Check for STOP opt-out
    if (body.trim().toUpperCase() === 'STOP') {
      // Mark user as unsubscribed in registrations.db
      const regDb2 = new Database(path.join(process.cwd(), 'registrations.db'));
      regDb2.prepare('UPDATE registrations SET unsubscribed = 1, unsubscribedDate = ? WHERE REPLACE(REPLACE(phone, \'-\', \'\'), \'(\', \'\') = ?')
        .run(new Date().toISOString(), from.replace(/\D/g, '').replace(/^1/, ''));
      regDb2.close();
      // Remove all reviews from this user
      const db = new Database(path.join(process.cwd(), 'reviews.db'));
      db.prepare('DELETE FROM reviews WHERE REPLACE(REPLACE("from", \'-\', \'\'), \'(\', \'\') = ?')
        .run(from.replace(/\D/g, '').replace(/^1/, ''));
      db.close();
      return new NextResponse('You have been unsubscribed from Puddy Pictures Movie Club.', { status: 200 });
    }

    // Add new review
    const db = new Database(path.join(process.cwd(), 'reviews.db'));
    db.prepare('INSERT INTO reviews ("from", "to", code, review, displayName, raw, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(from, to, code, review, displayName, body, timestamp);
    db.close();

    // Respond with success (Twilio expects a 200 OK)
    return new NextResponse('Review received. Thank you!', { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
