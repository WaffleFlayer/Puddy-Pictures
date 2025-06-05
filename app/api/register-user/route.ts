import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  // Check if displayName is taken
  const { searchParams } = new URL(req.url);
  const displayName = searchParams.get('displayName');
  if (displayName) {
    const registrationsFile = path.join(process.cwd(), 'registrations.json');
    let taken = false;
    if (fs.existsSync(registrationsFile)) {
      const registrations = JSON.parse(fs.readFileSync(registrationsFile, 'utf-8'));
      taken = registrations.some((r: any) => r.displayName && r.displayName.trim().toLowerCase() === displayName.trim().toLowerCase());
    }
    return NextResponse.json({ taken });
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

  // Check for duplicate displayName
  const registrationsFile = path.join(process.cwd(), 'registrations.json');
  let registrations = [];
  if (fs.existsSync(registrationsFile)) {
    registrations = JSON.parse(fs.readFileSync(registrationsFile, 'utf-8'));
  }
  // Convert displayName to string for comparison
  const displayNameStr = typeof displayName === 'string' ? displayName : '';
  if (displayNameStr && registrations.some((r: any) => typeof r.displayName === 'string' && r.displayName.trim().toLowerCase() === displayNameStr.trim().toLowerCase())) {
    return NextResponse.json({ error: 'Display name already taken.' }, { status: 400 });
  }

  registrations.push({
    name,
    displayName: displayNameStr,
    phone,
    consent: true,
    date: new Date().toISOString(),
  });

  fs.writeFileSync(
    registrationsFile,
    JSON.stringify(registrations, null, 2),
    'utf-8'
  );

  return NextResponse.json({ success: true });
}
