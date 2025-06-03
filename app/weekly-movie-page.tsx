// Admin/automation page to view and set the weekly movie
'use client';
import { useState, useEffect } from 'react';

function WeeklyMoviePublic({ movie }: { movie: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (movie && movie.code) {
      setLoading(true);
      fetch(`/api/get-reviews?code=${movie.code}`)
        .then(r => r.json())
        .then(data => setReviews(data))
        .finally(() => setLoading(false));
    }
  }, [movie]);
  if (!movie || !movie.title) return null;
  return (
    <div className="my-10 p-8 bg-[#23243a] border-4 border-[#00fff7] rounded-3xl max-w-2xl mx-auto">
      <h2 className="text-3xl font-extrabold text-[#00fff7] mb-2 font-retro">This Week's Movie</h2>
      <div className="text-2xl font-bold text-[#ff00c8] mb-2">{movie.title} <span className="text-lg text-[#fffbe7] font-normal">({movie.release_year})</span></div>
      {/* Remove AI Intro from public display */}
      <div className="mb-2 text-[#eaf6fb]">{movie.description}</div>
      <div className="mb-2 text-[#a084ff]">Review Code: <span className="font-mono">{movie.code}</span></div>
      <div className="mb-2 text-[#00fff7]">Reply to the club SMS with this code at the start of your review!</div>
      <div className="mt-6">
        <h3 className="text-2xl font-bold text-[#ff00c8] mb-2">Reviews</h3>
        {loading ? <div className="text-[#00fff7]">Loading reviews...</div> :
          reviews.length === 0 ? <div className="text-[#a084ff]">No reviews yet.</div> :
          <ul className="space-y-3">
            {reviews.map((r, i) => (
              <li key={i} className="bg-[#181c2b] border-2 border-[#ff00c8] rounded-xl p-4 text-[#eaf6fb]">
                <div className="text-lg text-[#00fff7] mb-1">{r.review}</div>
                <div className="text-xs text-[#a084ff]">Submitted {r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</div>
              </li>
            ))}
          </ul>
        }
      </div>
    </div>
  );
}

// Helper to generate a witty AI intro for the SMS based on the movie
async function getWittyIntro(movie: any): Promise<string> {
  if (!movie || !movie.title) return '';
  try {
    const res = await fetch('/api/ai-witty-intro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movie }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.intro || '';
    }
  } catch (e) {
    // fallback below
  }
  // fallback template
  const genre = movie.genre ? `a ${movie.genre.toLowerCase()} film` : 'a film';
  const decade = movie.release_year ? `from the ${movie.release_year.slice(0,3)}0s` : '';
  return `🎬 This week's pick is "${movie.title}" (${movie.release_year}) — ${genre} ${decade}. Get ready for a wild ride!`;
}

export default function WeeklyMovieAdmin() {
  const [movie, setMovie] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [status, setStatus] = useState('');
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    fetch('/api/weekly-movie')
      .then(r => r.json())
      .then(data => { if (!data.error) setMovie(data); });
  }, []);

  // Roll Weekly Movie handler
  const handleRollWeeklyMovie = async () => {
    setRolling(true);
    setStatus('Rolling random movie...');
    try {
      const res = await fetch('/api/generate-movie', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      if (res.ok) {
        const data = await res.json();
        // Add a random 6-char code for review (if not present)
        if (!data.code) {
          data.code = Math.random().toString(36).substring(2, 8).toUpperCase();
        }
        setForm(data);
        setMovie(data);
        setStatus('Movie rolled! You can edit details or set as weekly movie.');
      } else {
        setStatus('Error rolling movie.');
      }
    } catch {
      setStatus('Error rolling movie.');
    }
    setRolling(false);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus('');
    const res = await fetch('/api/weekly-movie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus('Weekly movie set!');
      setMovie(form);
    } else {
      setStatus('Error setting weekly movie.');
    }
  };

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/weekly-movie` : '';

  return (
    <div className="min-h-screen bg-[#181c2b] text-[#eaf6fb] p-8 font-retro">
      <h1 className="text-4xl font-extrabold text-[#00fff7] mb-6">Weekly Movie Admin</h1>
      <button
        type="button"
        className="mb-6 px-6 py-2 bg-gradient-to-r from-[#ff00c8] to-[#00fff7] text-[#23243a] font-bold rounded shadow border-2 border-[#ff00c8] disabled:opacity-60"
        onClick={handleRollWeeklyMovie}
        disabled={rolling}
      >
        {rolling ? 'Rolling...' : 'Roll Weekly Movie'}
      </button>
      {movie && movie.title && (
        <div className="mb-8 p-6 bg-[#23243a] border-2 border-[#00fff7] rounded-xl">
          <h2 className="text-2xl font-bold text-[#ff00c8]">Current Weekly Movie</h2>
          <div className="mt-2 text-lg">{movie.title} ({movie.release_year})</div>
          {/* AI Intro Display */}
          {/* Removed AI intro from public view */}
          <div className="text-[#a084ff]">Review Code: {movie.code}</div>
          <div className="mt-2">
            <span className="font-bold text-[#00fff7]">Public Link: </span>
            <a href="/weekly-movie" className="underline text-[#00fff7] hover:text-[#ff00c8]">/weekly-movie</a>
            <button className="ml-2 px-2 py-1 bg-[#00fff7] text-[#23243a] rounded font-bold" onClick={() => {navigator.clipboard.writeText(publicUrl);}}>Copy Link</button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input name="title" placeholder="Title" className="w-full p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" onChange={handleChange} value={form.title || ''} required />
        <input name="release_year" placeholder="Release Year" className="w-full p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" onChange={handleChange} value={form.release_year || ''} required />
        <input name="code" placeholder="Review Code (6 chars)" className="w-full p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" maxLength={6} minLength={6} onChange={handleChange} value={form.code || ''} required />
        <input name="director" placeholder="Director" className="w-full p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" onChange={handleChange} value={form.director || ''} />
        <input name="country" placeholder="Country" className="w-full p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" onChange={handleChange} value={form.country || ''} />
        <input name="genre" placeholder="Genre" className="w-full p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" onChange={handleChange} value={form.genre || ''} />
        <input name="budget" placeholder="Budget" className="w-full p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" onChange={handleChange} value={form.budget || ''} />
        <input name="watch_info" placeholder="Where to Watch" className="w-full p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" onChange={handleChange} value={form.watch_info || ''} />
        <input name="poster_url" placeholder="Poster URL" className="w-full p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" onChange={handleChange} value={form.poster_url || ''} />
        <textarea name="description" placeholder="Description" className="w-full p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" onChange={handleChange} value={form.description || ''} />
        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] font-bold rounded shadow border-2 border-[#00fff7]">Set Weekly Movie</button>
      </form>
      {status && <div className="mt-4 text-lg text-[#00fff7]">{status}</div>}
      {/* Public preview for admin */}
      <WeeklyMoviePublic movie={movie} />
    </div>
  );
}
