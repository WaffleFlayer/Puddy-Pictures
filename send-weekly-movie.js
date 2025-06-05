// send-weekly-movie.js
// Script to send the weekly movie MMS to all subscribers using Twilio

const fs = require('fs');
const path = require('path');
const twilio = require('twilio');

// Load .env variables
require('dotenv').config();

// Load environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
if (!accountSid || !authToken || !fromNumber) {
  console.error('Missing Twilio environment variables.');
  process.exit(1);
}
const client = twilio(accountSid, authToken);

// Load subscribers and weekly movie
const registrationsPath = path.join(__dirname, 'registrations.json');
const weeklyMoviePath = path.join(__dirname, 'weekly-movie.json');

if (!fs.existsSync(registrationsPath)) {
  console.error('registrations.json not found.');
  process.exit(1);
}
if (!fs.existsSync(weeklyMoviePath)) {
  console.error('weekly-movie.json not found.');
  process.exit(1);
}

const registrations = JSON.parse(fs.readFileSync(registrationsPath, 'utf-8'));
const movie = JSON.parse(fs.readFileSync(weeklyMoviePath, 'utf-8'));

if (!movie.title || !movie.code) {
  console.error('No weekly movie set or missing required fields.');
  process.exit(1);
}

const message = `Puddy Pictures Movie Club 🎬\n\nThis week's pick: ${movie.title} (${movie.release_year})\n${movie.description}\nWhere to watch: ${movie.watch_info}\nReply with code ${movie.code} to review!`;

async function sendAll() {
  for (const sub of registrations) {
    if (!sub.phone) continue;
    try {
      const msg = await client.messages.create({
        body: message,
        from: fromNumber,
        to: sub.phone,
        mediaUrl: movie.poster_url ? [movie.poster_url] : undefined
      });
      console.log(`Sent to ${sub.phone}: ${msg.sid}`);
    } catch (err) {
      console.error(`Failed to send to ${sub.phone}:`, err.message);
    }
  }
}

sendAll();
