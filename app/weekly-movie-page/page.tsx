// Admin/automation page to view and set the weekly movie
'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';

type PickerType = "region" | "genre" | "decade" | "budget";
type Selections = Partial<Record<PickerType, string>>;
type MovieResult = {
  title: string;
  release_year: string;
  description: string;
  director: string;
  country: string;
  genre: string;
  budget: string;
  watch_info: string;
  poster_url?: string;
  code?: string;
  ai_intro?: string; // <-- add this line
};

const wheels: Record<PickerType, string[]> = {
  region: [
    "North America",
    "Europe",
    "Asia",
    "Latin America",
    "Africa",
    "Oceania",
  ],
  genre: [
    "Drama",
    "Comedy",
    "Horror",
    "Action",
    "Sci-Fi",
    "Romance",
    "Thriller",
    "Animation",
    "Documentary",
  ],
  decade: [
    "1950s",
    "1960s",
    "1970s",
    "1980s",
    "1990s",
    "2000s",
    "2010s",
    "2020s",
  ],
  budget: [
    "Micro-budget",
    "Indie",
    "Studio",
    "Blockbuster",
  ],
};
const order: PickerType[] = ["region", "genre", "decade", "budget"];

// Helper to generate a review code
function generateMovieCode(title: string, year: string) {
  const clean = (title || "").replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const code = (clean.slice(0, 3) + (year ? year.slice(-2) : "00") + Math.floor(Math.random() * 10)).padEnd(6, 'X');
  return code;
}

// Helper to generate SMS preview
function getSMSPreview(movie: MovieResult, intro: string) {
  // Prefer the AI intro if present, otherwise use the fallback intro
  const wittyIntro = movie.ai_intro || intro;
  return `${wittyIntro}\n\n` +
    `Title: ${movie.title}\n` +
    `Year: ${movie.release_year}\n` +
    `Description: ${movie.description}\n` +
    `Director: ${movie.director}\n` +
    `Country: ${movie.country}\n` +
    `Genre: ${movie.genre}\n` +
    `Budget: ${movie.budget}\n` +
    `Where to watch: ${movie.watch_info}\n` +
    `Review code: ${movie.code}\n` +
    `Reply to the club SMS with this code at the start of your review!`;
}

function WeeklyMoviePublic({ movie }: { movie: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (movie && movie.code) {
      setLoading(true);
      fetch(`/api/get-reviews?code=${movie.code}`)
        .then(r => r.json())
        .then((data) => setReviews(data))
        .finally(() => setLoading(false));
    }
  }, [movie]);
  if (!movie || !movie.title) return null;
  return (
    <div className="my-10 p-8 bg-[#23243a] border-4 border-[#00fff7] rounded-3xl max-w-2xl mx-auto">
      <h2 className="text-3xl font-extrabold text-[#00fff7] mb-2 font-retro">This Week's Movie</h2>
      <div className="text-2xl font-bold text-[#ff00c8] mb-2">{movie.title} <span className="text-lg text-[#fffbe7] font-normal">({movie.release_year})</span></div>
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

function WeeklyMovieBox({ movie }: { movie: any }) {
  if (!movie || !movie.title) return null;
  return (
    <div className="p-8 bg-[#23243a] border-4 border-[#00fff7] rounded-3xl max-w-2xl w-full mx-auto my-8">
      <div className="text-3xl font-bold text-[#ff00c8] mb-2">{movie.title} <span className="text-lg text-[#fffbe7] font-normal">({movie.release_year})</span></div>
      <div className="mb-2 text-[#eaf6fb]">{movie.description}</div>
      <div className="mb-2 text-[#a084ff]">Review Code: <span className="font-mono">{movie.code}</span></div>
      <div className="mb-2 text-[#00fff7]">Reply to the club SMS with this code at the start of your review!</div>
    </div>
  );
}

export default function WeeklyMovieAdmin() {
  // Password protection state
  const [pw, setPw] = useState("");
  const [pwOk, setPwOk] = useState(false);
  const [pwError, setPwError] = useState("");

  const [movie, setMovie] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [status, setStatus] = useState('');
  // State for wheels and result
  const [selections, setSelections] = useState<Selections>({});
  const [spinning, setSpinning] = useState(false);
  const [spinResults, setSpinResults] = useState<string[]>([]);
  const [result, setResult] = useState<MovieResult | null>(null);
  const [intro, setIntro] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // Store password in sessionStorage for session persistence
  useEffect(() => {
    const savedPw = sessionStorage.getItem('admin_pw');
    if (savedPw) {
      setPw(savedPw);
      setPwOk(true);
    }
  }, []);

  useEffect(() => {
    if (pwOk && pw) {
      sessionStorage.setItem('admin_pw', pw);
    }
  }, [pwOk, pw]);

  // Helper to fetch with admin password header
  const fetchWithPassword = async (url: string, options: any = {}) => {
    const headers = options.headers || {};
    headers['x-admin-password'] = pw;
    options.headers = headers;
    return fetch(url, options);
  };

  // Fetch weekly movie with password header after login
  useEffect(() => {
    if (!pwOk) return;
    fetchWithPassword('/api/weekly-movie')
      .then(async r => {
        if (!r.ok) throw new Error('Unauthorized or error');
        return r.json();
      })
      .then(data => { if (!data.error) setMovie(data); })
      .catch(() => setMovie(null));
  }, [pwOk]);

  // Password gate
  if (!pwOk) {
    const tryPassword = async () => {
      try {
        const res = await fetchWithPassword('/api/weekly-movie');
        if (res.ok) {
          setPwOk(true);
          setPwError("");
          sessionStorage.setItem('admin_pw', pw);
        } else {
          setPwError("Incorrect password.");
        }
      } catch {
        setPwError("Server error.");
      }
    };
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#181c2b] text-[#eaf6fb] font-retro">
        <div className="bg-[#23243a] border-4 border-[#00fff7] rounded-3xl p-10 max-w-md w-full flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-[#00fff7] mb-6">Admin Access</h1>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwError(""); }}
            placeholder="Enter admin password"
            className="w-full p-3 rounded bg-[#1a2233] border-2 border-[#00fff7] text-[#eaf6fb] mb-4 text-lg text-center"
            onKeyDown={e => { if (e.key === 'Enter') { tryPassword(); }}}
          />
          <button
            className="px-8 py-2 bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] font-bold rounded shadow border-2 border-[#00fff7] text-lg"
            onClick={tryPassword}
          >
            Enter
          </button>
          {pwError && <div className="mt-4 text-[#ff00c8]">{pwError}</div>}
        </div>
      </div>
    );
  }

  // Spin logic (same as picker)
  // Helper to spin a wheel and return the chosen value
  const spinWheel = (type: PickerType): Promise<string> => {
    return new Promise((resolve) => {
      const options = wheels[type];
      const choice = options[Math.floor(Math.random() * options.length)];
      setSelections((prev) => ({ ...prev, [type]: choice }));
      setTimeout(() => resolve(choice), 400);
    });
  };

  const runSequence = async () => {
    setSpinning(true);
    setSpinResults([]);
    setResult(null);
    setIntro("");
    let newSelections: Selections = {};
    let newResults: string[] = [];
    // Spin each wheel and update local selections and results
    for (const type of order) {
      const value = await spinWheel(type);
      newSelections = { ...newSelections, [type]: value };
      newResults.push(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${value}`);
      setSpinResults([...newResults]);
    }
    setSelections(newSelections); // ensure state matches what was spun
    // Log the rolled values for verification
    console.log('Rolled wheel values:', newSelections);
    // Use the local newSelections for the API call
    try {
      const res = await fetch("/api/generate-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSelections),
      });
      if (!res.ok) throw new Error("Server error");
      const data: MovieResult = await res.json();
      // Generate code
      const movieCode = generateMovieCode(data.title, data.release_year);
      data.code = movieCode;
      // Fetch AI intro from API
      let aiIntro = '';
      try {
        // Try both {movie} and flat movie fields for compatibility
        let aiRes = await fetch('/api/ai-witty-intro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movie: data })
        });
        if (!aiRes.ok) {
          // fallback: try flat fields (legacy API)
          aiRes = await fetch('/api/ai-witty-intro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: data.title,
              genre: data.genre,
              country: data.country,
              year: data.release_year,
              description: data.description
            })
          });
        }
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          aiIntro = aiData.intro || '';
        } else {
          aiIntro = `It's time for a ${data.genre} from ${data.country} (${data.release_year})!`;
        }
      } catch {
        aiIntro = `It's time for a ${data.genre} from ${data.country} (${data.release_year})!`;
      }
      setResult({ ...data, ai_intro: aiIntro });
      setIntro(aiIntro);
    } catch (err) {
      setResult(null);
    }
    setSpinning(false);
  };

  // Save as weekly movie
  const saveWeeklyMovie = async () => {
    if (!result) return;
    setSaving(true);
    setSaveStatus("");
    try {
      const res = await fetch("/api/weekly-movie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pw // Add admin password header for POST
        },
        body: JSON.stringify(result), // result now includes ai_intro
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaveStatus("Weekly movie set!");
    } catch (err) {
      setSaveStatus("Error saving weekly movie.");
    }
    setSaving(false);
  };

  return (
    <>
      <Head>
        <title>Puddy Pictures</title>
      </Head>
      <div className="min-h-screen bg-[#181c2b] text-[#eaf6fb] p-8 font-retro">
        {/* Navigation Bar */}
        <nav className="w-full flex items-center justify-between px-8 py-4 bg-[#23243a]/90 shadow-lg z-10 border-b-4 border-[#00fff7] mb-8">
          <div className="flex items-center gap-3">
            <img src="/globe.svg" alt="Puddy Pictures Logo" className="h-10 w-10 animate-spin-slow" />
            <span className="text-3xl font-extrabold tracking-tight text-[#00fff7] font-retro italic" style={{letterSpacing:'-1px'}}>Puddy Pictures</span>
          </div>
          <div className="flex gap-8 text-lg">
            <a href="/" className="hover:text-[#ff00c8] transition font-semibold">Home</a>
            <a href="/privacy" className="hover:text-[#ff00c8] transition font-semibold">Privacy</a>
            <a href="/terms" className="hover:text-[#ff00c8] transition font-semibold">Terms</a>
            <a href="/signup" className="hover:text-[#ff00c8] transition font-semibold">Sign Up</a>
            <a href="/admin-subscribers" className="hover:text-[#ff00c8] transition font-semibold">Subscribers</a>
          </div>
        </nav>
        <h1 className="text-4xl font-extrabold text-[#00fff7] mb-6">Weekly Movie Admin</h1>
        {/* Wheel UI */}
        <div className="w-full max-w-2xl mx-auto bg-[#23243a]/95 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-10 flex flex-col items-center gap-8 animate-glow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {order.map((type) => (
              <div key={type} className="flex flex-col items-start w-full">
                <label className="text-lg mb-2 font-bold text-[#00fff7] font-retro uppercase tracking-wider">{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                <select
                  className="text-lg p-3 rounded-xl border-2 border-[#00fff7] bg-[#1a2233] text-[#f3ede7] w-full font-retro shadow-[0_2px_8px_#00fff733]"
                  value={selections[type] || ""}
                  onChange={(e) => setSelections((prev) => ({ ...prev, [type]: e.target.value }))}
                >
                  <option value="">Select {type}</option>
                  {wheels[type].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-6 w-full justify-center mt-4">
            <button
              className="text-2xl px-10 py-3 bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] font-extrabold rounded-full shadow-lg hover:from-[#ff00c8] hover:to-[#00fff7] transition font-retro border-2 border-[#00fff7]"
              onClick={runSequence}
              disabled={spinning}
              style={{ opacity: spinning ? 0.6 : 1 }}
            >
              {spinning ? "Spinning..." : "Spin for Weekly Movie"}
            </button>
          </div>
          <div className="mt-4 text-xl text-[#00fff7] min-h-[40px] w-full text-center font-retro tracking-wider">
            {spinResults.map((r, i) => (
              <p key={i}>{r}</p>
            ))}
          </div>
        </div>
        {/* Result Card and SMS Preview */}
        {result && (
          <div className="w-full max-w-3xl mx-auto bg-[#23243a]/98 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-12 flex flex-col gap-8 items-center mt-10 animate-fade-in min-h-[420px]">
            {result.poster_url && (
              <img
                src={result.poster_url}
                alt={result.title}
                className="rounded-2xl shadow-2xl max-w-[420px] max-h-[80vh] border-4 border-[#00fff7] bg-[#1a2233] mb-4"
                style={{boxShadow:'0 4px 32px #00fff7', width: '100%', height: 'auto', objectFit: 'cover'}} />
            )}
            {/* AI Intro Display removed from public view */}
            <h2 className="text-4xl mb-2 font-extrabold text-[#00fff7] font-retro italic tracking-tight" style={{letterSpacing:'-1px',textShadow:'0 1px 0 #fff, 2px 2px 0 #00fff7'}}>
              {result.title} <span className="text-2xl text-[#fffbe7] font-normal">({result.release_year})</span>
            </h2>
            <p className="mb-2 text-lg text-[#00fff7] font-bold">Description:<span className="text-[#f3ede7] font-normal ml-2">{result.description}</span></p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-lg w-full mb-4">
              <span className="font-bold text-[#00fff7]">Director:</span>
              <span className="text-[#f3ede7]">{result.director}</span>
              <span className="font-bold text-[#00fff7]">Country:</span>
              <span className="text-[#f3ede7]">{result.country}</span>
              <span className="font-bold text-[#00fff7]">Genre:</span>
              <span className="text-[#f3ede7]">{result.genre}</span>
              <span className="font-bold text-[#00fff7]">Budget:</span>
              <span className="text-[#f3ede7]">{result.budget}</span>
              <span className="font-bold text-[#00fff7]">Where to watch:</span>
              <span className="text-[#f3ede7]">{result.watch_info}</span>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[#181c2b] border-2 border-[#00fff7] text-[#00fff7] font-mono text-lg select-all">
              <span className="font-bold">Review Code:</span> {result.code}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[#181c2b] border-2 border-[#ff00c8] text-[#ff00c8] font-mono text-lg w-full">
              <span className="font-bold">SMS Preview:</span>
              <div className="text-[#eaf6fb] mt-2 whitespace-pre-line">{getSMSPreview(result, intro)}</div>
            </div>
            <button
              className="text-2xl px-10 py-3 bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] font-extrabold rounded-full shadow-lg hover:from-[#ff00c8] hover:to-[#00fff7] transition font-retro border-2 border-[#00fff7] mt-4"
              onClick={saveWeeklyMovie}
              disabled={saving}
            >
              {saving ? "Saving..." : "Set as Weekly Movie"}
            </button>
            {saveStatus && <div className="mt-2 text-lg text-[#00fff7]">{saveStatus}</div>}
          </div>
        )}
        {/* Public preview for admin - replaced with home page style */}
        {movie && movie.title && (
          <div className="w-full max-w-5xl mx-auto my-16 p-12 bg-[#23243a] border-4 border-[#00fff7] rounded-3xl flex flex-col md:flex-row gap-14 items-center animate-fade-in min-h-[520px] min-w-[340px] md:min-h-[600px] md:min-w-[900px]">
            {/* Poster Area */}
            <div className="flex-[1.2] flex justify-center items-center">
              {movie.poster_url && (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="rounded-2xl shadow-2xl max-w-[420px] max-h-[80vh] border-4 border-[#00fff7] bg-[#1a2233]"
                  style={{boxShadow:'0 4px 32px #00fff7', width: '100%', height: 'auto', objectFit: 'cover'}} />
              )}
            </div>
            {/* Info Area */}
            <div className="flex-[2] flex flex-col justify-center items-start p-2 md:p-6 bg-[#23243a]/80 rounded-2xl border-2 border-[#00fff7] min-h-[420px] w-full">
              <h2 className="text-5xl mb-4 font-extrabold text-[#00fff7] font-retro italic tracking-tight" style={{letterSpacing:'-1px',textShadow:'0 1px 0 #fff, 2px 2px 0 #00fff7'}}>
                {movie.title} <span className="text-3xl text-[#fffbe7] font-normal">({movie.release_year})</span>
              </h2>
              <p className="mb-6 text-lg text-[#00fff7] font-bold">Description:<span className="text-[#f3ede7] font-normal ml-2">{movie.description}</span></p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-lg w-full mb-4">
                <span className="font-bold text-[#00fff7]">Director:</span>
                <span className="text-[#f3ede7]">{movie.director}</span>
                <span className="font-bold text-[#00fff7]">Country:</span>
                <span className="text-[#f3ede7]">{movie.country}</span>
                <span className="font-bold text-[#00fff7]">Genre:</span>
                <span className="text-[#f3ede7]">{movie.genre}</span>
                <span className="font-bold text-[#00fff7]">Budget:</span>
                <span className="text-[#f3ede7]">{movie.budget}</span>
                <span className="font-bold text-[#00fff7]">Where to watch:</span>
                <span className="text-[#f3ede7]">{movie.watch_info}</span>
              </div>
              <div className="mb-2 text-[#a084ff]">Review Code: <span className="font-mono">{movie.code}</span></div>
              <div className="mb-2 text-[#00fff7]">Reply to the club SMS with this code at the start of your review!</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
