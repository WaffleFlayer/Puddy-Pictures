import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

export async function GET(req: NextRequest) {
  // Check if displayName is taken
  const { searchParams } = new URL(req.url);
  const displayName = searchParams.get('displayName');
  if (displayName) {
    const db = new Database(path.join(process.cwd(), 'registrations.db'));
    const row = db.prepare('SELECT 1 FROM registrations WHERE LOWER(displayName) = ? LIMIT 1').get(displayName.trim().toLowerCase());
    db.close();
    return NextResponse.json({ taken: !!row });
  }
  return NextResponse.json({});
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get('name');
  const displayName = formData.get('displayName');
  const phone = formData.get('phone');
  const consent = formData.get('consent');

  if (!consent) {
    return NextResponse.json({ error: 'Consent required to register.' }, { status: 400 });
  }

  const db = new Database(path.join(process.cwd(), 'registrations.db'));
  // Check for duplicate displayName
  const displayNameStr = typeof displayName === 'string' ? displayName : '';
  const exists = db.prepare('SELECT 1 FROM registrations WHERE LOWER(displayName) = ? LIMIT 1').get(displayNameStr.trim().toLowerCase());
  if (exists) {
    db.close();
    return NextResponse.json({ error: 'Display name already taken.' }, { status: 400 });
  }

  db.prepare('INSERT INTO registrations (name, displayName, phone, consent, date) VALUES (?, ?, ?, ?, ?)')
    .run(name, displayNameStr, phone, 1, new Date().toISOString());
  db.close();

  // Send welcome text via Twilio
  if (typeof phone === 'string' && phone.trim()) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (accountSid && authToken && fromNumber) {
        const client = twilio(accountSid, authToken);
        await client.messages.create({
          body: `Welcome to Puddy Pictures Movie Club! 🎬\nYou are now subscribed for weekly movie picks and reviews. Reply STOP to unsubscribe at any time.`,
          from: fromNumber,
          to: phone
        });
      }
    } catch (err) {
      // Log Twilio errors but don't block registration
      if (err instanceof Error) {
        console.error('Twilio welcome SMS error:', err.message);
      } else {
        console.error('Twilio welcome SMS error:', err);
      }
    }
  }

  return NextResponse.json({ success: true });
}
