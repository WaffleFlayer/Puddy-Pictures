import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get('name');
  const phone = formData.get('phone');
  const consent = formData.get('consent');

  if (!consent) {
    return NextResponse.json({ error: 'Consent required to register.' }, { status: 400 });
  }

  const registrationsFile = path.join(process.cwd(), 'registrations.json');
  let registrations = [];
  if (fs.existsSync(registrationsFile)) {
    registrations = JSON.parse(fs.readFileSync(registrationsFile, 'utf-8'));
  }

  registrations.push({
    name,
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
