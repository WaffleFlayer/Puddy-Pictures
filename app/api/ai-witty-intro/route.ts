import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { movie } = await req.json();
  if (!movie || !movie.title) {
    return NextResponse.json({ intro: '' });
  }
  // Compose a prompt for OpenAI
  const prompt = `You are a witty, funny movie club host. Write a very short, clever, and playful one-sentence intro (max 20 words) for this week's movie club pick, based on the following movie details. Make it extremely witty, surprising, and memorable—use wordplay, puns, or clever references. Channel your inner late-night talk show host or stand-up comedian. The intro should make the recipient smile or laugh. Never be generic or bland. Reference the movie's genre, decade, or any notable details if possible. Do NOT mention the movie title in the intro.

Movie details: ${JSON.stringify(movie)}

Intro:`;

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Missing OpenAI API key');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a witty movie club host.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 80,
        temperature: 0.9,
      }),
    });
    const data = await response.json();
    const intro = data.choices?.[0]?.message?.content?.trim() || '';
    return NextResponse.json({ intro });
  } catch (e) {
    // fallback
    const genre = movie.genre ? `a ${movie.genre.toLowerCase()} film` : 'a film';
    const decade = movie.release_year ? `from the ${movie.release_year.slice(0,3)}0s` : '';
    return NextResponse.json({ intro: `🎬 This week's pick is "${movie.title}" (${movie.release_year}) — ${genre} ${decade}. Get ready for a wild ride!` });
  }
}
