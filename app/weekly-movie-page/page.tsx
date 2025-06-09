// Admin/automation page to view and set the weekly movie
'use client';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

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
  // Remove 'The ' from the start of the title if present (case-insensitive)
  let processedTitle = (title || "").trim();
  if (/^the\s+/i.test(processedTitle)) {
    processedTitle = processedTitle.replace(/^the\s+/i, '');
  }
  let clean = processedTitle.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  // List of banned 3-letter prefixes (add more as needed)
  const banned = ["ASS", "NIG", "FAG", "CUM", "SEX", "DIE", "FUK", "FUC", "TIT", "PIS", "PUS", "DIC", "COC", "COK", "JIZ", "GAY", "RAP", "SUC", "SUK", "FAP", "FAG", "FCK", "FUC", "FUK", "FUX", "XXX"];
  let prefix = clean.slice(0, 3);
  let code;
  let attempts = 0;
  // Try up to 10 times to avoid a banned prefix
  do {
    prefix = clean.slice(0, 3);
    if (banned.includes(prefix)) {
      // If banned, shift by one character (or randomize if too short)
      clean = clean.length > 3 ? clean.slice(1) : Math.random().toString(36).substring(2, 5).toUpperCase();
    }
    code = (prefix + (year ? year.slice(-2) : "00") + Math.floor(Math.random() * 10)).padEnd(6, 'X');
    attempts++;
  } while (banned.includes(prefix) && attempts < 10);
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
                {r.displayName && <div className="text-sm text-[#00fff7] font-bold">– {r.displayName}</div>}
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

function AdminNav() {
  return (
    <header className="w-full flex flex-col items-center py-6 bg-gradient-to-r from-[#181c2b] via-[#23243a] to-[#181c2b] shadow-lg border-b-4 border-[#00fff7] mb-10">
      <nav className="flex flex-wrap gap-8 justify-center items-center">
        <Link href="/" className="text-2xl font-extrabold text-[#00fff7] hover:text-[#ff00c8] transition">Public Home</Link>
        <Link href="/admin" className="text-2xl font-extrabold text-[#00fff7] hover:text-[#ff00c8] transition">Admin Home</Link>
        <Link href="/weekly-movie-page" className="text-2xl font-extrabold text-[#00fff7] hover:text-[#ff00c8] transition">Weekly Movie</Link>
        <Link href="/admin-subscribers" className="text-2xl font-extrabold text-[#00fff7] hover:text-[#ff00c8] transition">Subscribers</Link>
        <Link href="/admin-reviews" className="text-2xl font-extrabold text-[#00fff7] hover:text-[#ff00c8] transition">Reviews</Link>
        <Link href="/export-registrations" className="text-2xl font-extrabold text-[#00fff7] hover:text-[#ff00c8] transition">Export</Link>
      </nav>
    </header>
  );
}

function AdminFooter() {
  return (
    <footer className="w-full flex flex-col items-center py-6 bg-gradient-to-r from-[#23243a] via-[#181c2b] to-[#23243a] shadow-inner border-t-4 border-[#ff00c8] mt-16">
      <nav className="flex flex-wrap gap-8 justify-center items-center">
        <Link href="/" className="text-lg font-bold text-[#ff00c8] hover:text-[#00fff7] transition">Public Home</Link>
        <Link href="/admin" className="text-lg font-bold text-[#ff00c8] hover:text-[#00fff7] transition">Admin Home</Link>
        <Link href="/weekly-movie-page" className="text-lg font-bold text-[#ff00c8] hover:text-[#00fff7] transition">Weekly Movie</Link>
        <Link href="/admin-subscribers" className="text-lg font-bold text-[#ff00c8] hover:text-[#00fff7] transition">Subscribers</Link>
        <Link href="/admin-reviews" className="text-lg font-bold text-[#ff00c8] hover:text-[#00fff7] transition">Reviews</Link>
        <Link href="/export-registrations" className="text-lg font-bold text-[#ff00c8] hover:text-[#00fff7] transition">Export</Link>
      </nav>
      <div className="mt-4 text-xs text-[#a084ff]">&copy; {new Date().getFullYear()} Puddy Pictures Admin</div>
    </footer>
  );
}

export default function WeeklyMovieAdmin() {
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

  // --- Slot machine animation state ---
  const [slotValues, setSlotValues] = useState<Selections>({});
  const slotIntervals = useRef<{ [key in PickerType]?: NodeJS.Timeout }>({});

  // --- Weekly Movie History ---
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/weekly-movie-history')
      .then(r => r.ok ? r.json() : [])
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [saveStatus]);

  // Remove password logic from fetchWithPassword
  const fetchWithPassword = async (url: string, options: any = {}) => {
    return fetch(url, options);
  };

  // Fetch weekly movie with password header after login
  useEffect(() => {
    fetchWithPassword('/api/weekly-movie')
      .then(async r => {
        if (!r.ok) throw new Error('Unauthorized or error');
        return r.json();
      })
      .then(data => { if (!data.error) setMovie(data); })
      .catch(() => setMovie(null));
  }, []);

  // Spin logic (now using slot machine animation)
  // --- Modified runSequence for slot animation ---
  const runSequence = async () => {
    setSpinning(true);
    setSpinResults([]);
    setResult(null);
    setIntro("");
    // Start slot animation for each picker
    order.forEach((type) => {
      let i = 0;
      slotIntervals.current[type] = setInterval(() => {
        setSlotValues((prev) => ({ ...prev, [type]: wheels[type][i % wheels[type].length] }));
        i++;
      }, 60 + 40 * order.indexOf(type)); // staggered speed
    });
    let newSelections: Selections = {};
    for (const type of order) {
      await new Promise((resolve) => setTimeout(resolve, 900 + 200 * order.indexOf(type)));
      // Stop the slot animation for this picker
      if (slotIntervals.current[type]) {
        clearInterval(slotIntervals.current[type]);
        slotIntervals.current[type] = undefined;
      }
      // Pick the real value
      const options = wheels[type];
      const choice = options[Math.floor(Math.random() * options.length)];
      setSelections((prev) => ({ ...prev, [type]: choice }));
      setSlotValues((prev) => ({ ...prev, [type]: choice }));
      newSelections = { ...newSelections, [type]: choice };
      setSpinResults((prev) => ([...prev, `${type.charAt(0).toUpperCase() + type.slice(1)}: ${choice}`]));
    }
    // Use the final selections from the wheel spins
    try {
      let data: MovieResult | null = null;
      let aiIntro = '';
      let attempts = 0;
      const maxAttempts = 10;
      let duplicate = false;
      do {
        duplicate = false;
        const res = await fetch("/api/generate-movie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSelections),
        });
        if (!res.ok) throw new Error("Server error");
        const raw = await res.json();
        // Defensive: ensure required fields
        if (!raw || !raw.title || !raw.release_year) {
          attempts++;
          duplicate = true;
          continue;
        }
        // Generate code
        const movieCode = generateMovieCode(raw.title, raw.release_year);
        data = { ...raw, code: movieCode } as MovieResult;
        // Check for duplicate in history (by title+release_year or code)
        if (history.some((m) => (m.title?.toLowerCase() === data!.title.toLowerCase() && m.release_year == data!.release_year) || (m.code && m.code === data!.code))) {
          duplicate = true;
          attempts++;
        } else {
          duplicate = false;
        }
      } while (duplicate && attempts < maxAttempts);
      if (!data || duplicate) {
        setResult(null);
        setIntro("");
        setSpinning(false);
        setSaveStatus("");
        setStatus("All generated movies are repeats. Try spinning again or change the criteria.");
        return;
      }
      // Fetch AI intro from API
      try {
        let aiRes = await fetch('/api/ai-witty-intro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movie: data })
        });
        if (!aiRes.ok) {
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
      // Ensure both year and release_year are present
      const movieToSave = {
        ...result,
        year: result.release_year || "",
        release_year: result.release_year || ""
      };
      const res = await fetch("/api/weekly-movie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movieToSave),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaveStatus("Weekly movie set!");
    } catch (err) {
      setSaveStatus("Error saving weekly movie.");
    }
    setSaving(false);
  };

  // Add this handler for deleting a movie from history
  const handleDeleteHistory = async (index: number) => {
    if (!window.confirm('Are you sure you want to remove this movie from history?')) return;
    try {
      const res = await fetch('/api/delete-weekly-movie-history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index })
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
      } else {
        alert('Failed to delete movie from history.');
      }
    } catch {
      alert('Failed to delete movie from history.');
    }
  };

  // Weekly Movie Text Schedule - Enhanced UI with backend integration
  const [scheduleDay, setScheduleDay] = useState("Friday");
  const [scheduleTime, setScheduleTime] = useState("18:00");
  const [scheduleFrequency, setScheduleFrequency] = useState("Weekly");
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // Fetch current schedule from backend
  useEffect(() => {
    fetch('/api/weekly-movie-schedule')
      .then(r => r.json())
      .then(data => {
        setScheduleDay(data.day_of_week || "Friday");
        setScheduleTime(data.time_of_day || "18:00");
        setScheduleFrequency(data.frequency || "Weekly");
      })
      .finally(() => setScheduleLoading(false));
  }, []);

  const handleScheduleSave = async () => {
    setScheduleSaved(false);
    setScheduleLoading(true);
    await fetch('/api/weekly-movie-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_of_week: scheduleDay,
        time_of_day: scheduleTime,
        frequency: scheduleFrequency
      })
    });
    setScheduleSaved(true);
    setScheduleLoading(false);
    setTimeout(() => setScheduleSaved(false), 2000);
  };

  return (
    <>
      <Head>
        <title>Puddy Pictures</title>
      </Head>
      <div className="min-h-screen bg-[#181c2b] text-[#eaf6fb] font-retro">
        <AdminNav />
        <h1 className="text-4xl font-extrabold text-[#00fff7] mb-6 text-center w-full">Weekly Movie Admin</h1>
        {/* Weekly Movie Text Schedule - now at the top */}
        <div className="w-full max-w-3xl mx-auto bg-[#23243a]/98 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-8 flex flex-col gap-8 items-center mt-10 mb-8">
          <h2 className="text-2xl font-bold text-[#ff00c8] mb-2 text-center">Weekly Movie Text Schedule</h2>
          <form className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <label className="text-lg text-[#00fff7] font-bold" htmlFor="schedule-day">Send day:</label>
            <select id="schedule-day" className="p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" value={scheduleDay} onChange={e => setScheduleDay(e.target.value)} disabled={scheduleLoading}>
              <option>Sunday</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>
            <label className="text-lg text-[#00fff7] font-bold ml-4" htmlFor="schedule-time">Send time:</label>
            <input id="schedule-time" type="time" className="p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} disabled={scheduleLoading} />
            <label className="text-lg text-[#00fff7] font-bold ml-4" htmlFor="schedule-frequency">Frequency:</label>
            <select id="schedule-frequency" className="p-2 rounded bg-[#1a2233] border border-[#00fff7] text-[#eaf6fb]" value={scheduleFrequency} onChange={e => setScheduleFrequency(e.target.value)} disabled={scheduleLoading}>
              <option>Weekly</option>
              <option>Biweekly</option>
              <option>Monthly</option>
            </select>
          </form>
          {scheduleLoading && <div className="text-[#a084ff] mt-2">Loading schedule...</div>}
          <div className="text-sm text-[#a084ff] mt-2 text-center">(This schedule determines when a new movie is selected and texted. Actual automation is handled by a backend job.)</div>
        </div>
        {/* Wheel UI - now slot machine style */}
        <div className="w-full max-w-2xl mx-auto bg-[#23243a]/95 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-10 flex flex-col items-center gap-8 animate-glow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {order.map((type) => (
              <div key={type} className="flex flex-col items-start w-full">
                <label className="text-lg mb-2 font-bold text-[#00fff7] font-retro uppercase tracking-wider">{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                <div className="text-lg p-3 rounded-xl border-2 border-[#00fff7] bg-[#1a2233] text-[#f3ede7] w-full font-retro shadow-[0_2px_8px_#00fff733] select-none">
                  {spinning ? slotValues[type] || 'Not selected' : selections[type] || 'Not selected'}
                </div>
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
          <div className="w-full max-w-3xl mx-auto bg-[#23243a]/98 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-12 flex flex-col gap-8 items-center mt-10">
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
        {/* Weekly Movie History Table */}
        {history.length > 0 && (
          <div className="w-full max-w-4xl mx-auto mt-16 mb-8">
            <h2 className="text-3xl font-extrabold text-[#00fff7] mb-4 font-retro">Previous Weekly Movies</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-[#23243a] border-4 border-[#00fff7] rounded-2xl shadow-xl">
                <thead>
                  <tr className="text-left text-[#00fff7] border-b-2 border-[#00fff7]">
                    <th className="p-3">Date</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Genre</th>
                    <th className="p-3">Country</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((m, i) => (
                    <tr key={i} className="border-b border-[#23243a] hover:bg-[#1a2233]">
                      <td className="p-2 whitespace-nowrap">{m.timestamp ? new Date(m.timestamp).toLocaleDateString() : ''}</td>
                      <td className="p-2 whitespace-nowrap">{m.title}</td>
                      <td className="p-2 whitespace-nowrap">{m.release_year}</td>
                      <td className="p-2 whitespace-nowrap">{m.genre}</td>
                      <td className="p-2 whitespace-nowrap">{m.country}</td>
                      <td className="p-2 font-mono">{m.code}</td>
                      <td className="p-2">
                        <button
                          className="px-3 py-1 bg-[#ff00c8] text-[#fffbe7] rounded font-bold hover:bg-[#a084ff] transition"
                          onClick={() => handleDeleteHistory(i)}
                          title="Remove from history"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <AdminFooter />
      </div>
    </>
  );
}
