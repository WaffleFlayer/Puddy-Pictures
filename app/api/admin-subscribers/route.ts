import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'; // Set this in your .env file

function checkAdminPassword(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  return password === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const registrationsFile = path.join(process.cwd(), 'registrations.json');
  let registrations = [];
  if (fs.existsSync(registrationsFile)) {
    registrations = JSON.parse(fs.readFileSync(registrationsFile, 'utf-8'));
  }
  return NextResponse.json(registrations);
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { phone } = await req.json();
  const registrationsFile = path.join(process.cwd(), 'registrations.json');
  let registrations = [];
  if (fs.existsSync(registrationsFile)) {
    registrations = JSON.parse(fs.readFileSync(registrationsFile, 'utf-8'));
  }
  const newRegistrations = registrations.filter((r: any) => r.phone !== phone);
  fs.writeFileSync(registrationsFile, JSON.stringify(newRegistrations, null, 2), 'utf-8');
  return NextResponse.json({ success: true });
}
