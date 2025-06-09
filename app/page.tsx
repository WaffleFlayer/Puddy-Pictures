'use client';

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import Head from 'next/head';
import Link from "next/link";

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
  code?: string; // Add code to MovieResult type
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

export default function Home() {
  const [selections, setSelections] = useState<Selections>({});
  const [spinResults, setSpinResults] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<MovieResult | null>(null);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [activeTab, setActiveTab] = useState<'picker' | 'club'>('picker');

  // Preload weekly movie and reviews for smooth tab switching
  const [weeklyMovie, setWeeklyMovie] = useState<any>(null);
  const [weeklyReviews, setWeeklyReviews] = useState<any[]>([]);
  const [weeklyLoading, setWeeklyLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchWeekly() {
      setWeeklyLoading(true);
      const res = await fetch('/api/weekly-movie');
      const data = await res.json();
      if (!ignore) {
        setWeeklyMovie(data);
        if (data && data.code) {
          const r = await fetch(`/api/get-reviews?code=${data.code}`);
          const reviews = await r.json();
          setWeeklyReviews(reviews);
        } else {
          setWeeklyReviews([]);
        }
        setWeeklyLoading(false);
      }
    }
    fetchWeekly();
    return () => { ignore = true; };
  }, []);

  // --- Filter state for each picker type ---
  const [filters, setFilters] = useState<Record<PickerType, Set<string>>>(() => {
    const initial: Record<PickerType, Set<string>> = {
      region: new Set(wheels.region),
      genre: new Set(wheels.genre),
      decade: new Set(wheels.decade),
      budget: new Set(wheels.budget),
    };
    return initial;
  });

  const handleFilterChange = (type: PickerType, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      const set = new Set(next[type]);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      next[type] = set;
      return next;
    });
  };

  // Helper to spin a wheel (simulate random selection)
  const spinWheel = (type: PickerType) => {
    return new Promise<void>((resolve) => {
      const options = Array.from(filters[type]);
      if (options.length === 0) return resolve();
      const choice = options[Math.floor(Math.random() * options.length)];
      setSelections((prev) => ({ ...prev, [type]: choice }));
      setTimeout(resolve, 500); // Simulate spin delay
    });
  };

  // Generate a unique code for the movie (e.g., 6-char alphanumeric)
  function generateMovieCode(title: string, year: string) {
    // Remove 'The ' from the start of the title if present (case-insensitive)
    let processedTitle = (title || "").trim();
    if (/^the\s+/i.test(processedTitle)) {
      processedTitle = processedTitle.replace(/^the\s+/i, '');
    }
    const clean = processedTitle.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    // List of banned 3-letter prefixes (add more as needed)
    const banned = ["ASS", "NIG", "FAG", "CUM", "SEX", "DIE", "FUK", "FUC", "TIT", "PIS", "PUS", "DIC", "COC", "COK", "JIZ", "JIZ", "GAY", "RAP", "SUC", "SUK", "FAP", "FAG", "FCK", "FUC", "FUK", "FUX", "XXX"];
    let prefix = clean.slice(0, 3);
    let code;
    let attempts = 0;
    // Try up to 10 times to avoid a banned prefix
    do {
      prefix = clean.slice(0, 3);
      if (banned.includes(prefix)) {
        // If banned, shift by one character (or randomize if too short)
        clean.length > 3 ? clean.slice(1, 4) : (prefix = Math.random().toString(36).substring(2, 5).toUpperCase());
      }
      code = (prefix + (year ? year.slice(-2) : "00") + Math.floor(Math.random() * 10)).padEnd(6, 'X');
      attempts++;
    } while (banned.includes(prefix) && attempts < 10);
    return code;
  }

  // Fetch reviews for the current movie code
  const fetchReviews = useCallback(async (code: string | undefined) => {
    if (!code) return;
    setLoadingReviews(true);
    setReviewsError("");
    try {
      const res = await fetch(`/api/get-reviews?code=${code}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      setReviewsError("Could not load reviews.");
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  // When result changes, fetch reviews
  useEffect(() => {
    if (showResult && result?.code) {
      fetchReviews(result.code);
    } else {
      setReviews([]);
    }
  }, [showResult, result?.code, fetchReviews]);

  // --- Slot machine animation state ---
  const [slotValues, setSlotValues] = useState<Selections>({});
  const slotIntervals = useRef<{ [key in PickerType]?: NodeJS.Timeout }>({});

  // --- Modified runSequence for slot animation ---
  const runSequence = async () => {
    setSpinning(true);
    setSpinResults([]);
    setShowResult(false);
    setError("");
    setResult(null);
    // Start slot animation for each picker
    order.forEach((type) => {
      let i = 0;
      const options = Array.from(filters[type]);
      slotIntervals.current[type] = setInterval(() => {
        setSlotValues((prev) => ({ ...prev, [type]: options[i % options.length] }));
        i++;
      }, 60 + 40 * order.indexOf(type)); // staggered speed
    });
    // Spin each wheel and update selections and results
    let newSelections: Selections = {};
    for (const type of order) {
      await new Promise((resolve) => setTimeout(resolve, 900 + 200 * order.indexOf(type)));
      // Stop the slot animation for this picker
      if (slotIntervals.current[type]) {
        clearInterval(slotIntervals.current[type]);
        slotIntervals.current[type] = undefined;
      }
      // Pick the real value
      const options = Array.from(filters[type]);
      if (options.length === 0) {
        setError(`No options selected for ${type}`);
        setSpinning(false);
        return;
      }
      const choice = options[Math.floor(Math.random() * options.length)];
      setSelections((prev) => ({ ...prev, [type]: choice }));
      setSlotValues((prev) => ({ ...prev, [type]: choice }));
      newSelections = { ...newSelections, [type]: choice };
      setSpinResults((prev) => ([...prev, `${type.charAt(0).toUpperCase() + type.slice(1)}: ${choice}`]));
    }
    // Use the final selections from the wheel spins
    try {
      const res = await fetch("/api/generate-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSelections),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Server error: " + res.status + " - " + errorText);
      }
      const data: MovieResult = await res.json();
      // Generate a code for this movie
      const movieCode = generateMovieCode(data.title, data.release_year);
      setResult({ ...data, code: movieCode });
      setShowResult(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setShowResult(true);
    }
    setSpinning(false);
  };

  const resetAll = () => {
    setSelections({});
    setSpinResults([]);
    setShowResult(false);
    setResult(null);
    setError("");
    setSpinning(false);
  };

  function WeeklyMoviePublicHomePreloaded({ movie, reviews, loading }: { movie: any, reviews: any[], loading: boolean }) {
    if (loading) return <div className="w-full flex justify-center items-center text-[#00fff7] font-retro text-xl py-10">Loading Weekly Movie...</div>;
    if (!movie || !movie.title) return null;
    return (
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
          <div className="mt-6 w-full">
            <h3 className="text-2xl font-bold text-[#ff00c8] mb-2">Reviews</h3>
            {reviews.length === 0 ? <div className="text-[#a084ff]">No reviews yet.</div> :
              <ul className="space-y-3">
                {reviews.map((r, i) => (
                  <li key={i} className="bg-[#181c2b] border-2 border-[#ff00c8] rounded-xl p-4 text-[#eaf6fb]">
                    <div className="text-lg text-[#00fff7] mb-1">{r.review}</div>
                    {r.displayName && (
                      <div className="text-sm text-[#ff00c8] font-bold mb-1">— {r.displayName}</div>
                    )}
                    <div className="text-xs text-[#a084ff]">Submitted {r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</div>
                  </li>
                ))}
              </ul>
            }
          </div>
        </div>
      </div>
    );
  }

  function PreviousWeeklyMovies() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openIndexes, setOpenIndexes] = useState<{[key: number]: boolean}>({});
    useEffect(() => {
      fetch('/api/public-weekly-movie-history')
        .then(r => r.ok ? r.json() : Promise.reject('Failed to fetch'))
        .then(setHistory)
        .catch(() => setError('Could not load previous movies.'))
        .finally(() => setLoading(false));
    }, []);

    const toggleOpen = (idx: number) => {
      setOpenIndexes(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    if (loading) return <div className="text-[#00fff7] font-retro text-lg py-6">Loading previous weekly movies...</div>;
    if (error) return <div className="text-[#ff00c8] font-retro text-lg py-6">{error}</div>;
    if (!history.length) return <div className="text-[#a084ff] font-retro text-lg py-6">No previous weekly movies yet.</div>;

    return (
      <div className="w-full max-w-5xl mx-auto mt-10 mb-20">
        <h2 className="text-3xl font-extrabold text-[#00fff7] mb-6 font-retro text-left">Previous Weekly Movies</h2>
        <div className="flex flex-col gap-4">
          {history.map((movie, idx) => (
            <div key={movie.code || idx}>
              <button
                className={`w-full text-left px-6 py-4 rounded-xl border-2 border-[#00fff7] bg-[#181c2b] text-[#00fff7] font-bold text-xl flex items-center justify-between transition hover:bg-[#23243a] ${openIndexes[idx] ? 'shadow-lg' : ''}`}
                onClick={() => toggleOpen(idx)}
                aria-expanded={openIndexes[idx] ? 'true' : 'false'}
              >
                <span>{movie.title} <span className="text-lg text-[#fffbe7] font-normal">({movie.release_year})</span></span>
                <span className={`ml-4 transition-transform ${openIndexes[idx] ? 'rotate-90' : ''}`}>▶</span>
              </button>
              {openIndexes[idx] && (
                <div className="mt-2">
                  <PreviousMovieWithReviews movie={movie} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function PreviousMovieWithReviews({ movie }: { movie: any }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      if (movie && movie.code) {
        fetch(`/api/get-reviews?code=${movie.code}`)
          .then(r => r.ok ? r.json() : [])
          .then(setReviews)
          .finally(() => setLoading(false));
      }
    }, [movie]);
    return (
      <div className="bg-[#23243a] border-2 border-[#00fff7] rounded-2xl p-8 flex flex-col md:flex-row gap-8">
        {movie.poster_url && (
          <img src={movie.poster_url} alt={movie.title} className="rounded-xl shadow-lg max-w-[180px] max-h-[260px] border-2 border-[#00fff7] bg-[#1a2233]" style={{objectFit:'cover'}} />
        )}
        <div className="flex-1 flex flex-col">
          <div className="text-2xl font-bold text-[#ff00c8] mb-1">{movie.title} <span className="text-lg text-[#fffbe7] font-normal">({movie.release_year})</span></div>
          <div className="mb-2 text-[#eaf6fb]">{movie.description}</div>
          <div className="mb-2 text-[#a084ff]">Review Code: <span className="font-mono">{movie.code}</span></div>
          <div className="mb-2 text-[#00fff7]">Reply to the club SMS with this code at the start of your review!</div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-[#ff00c8] mb-2">Reviews</h3>
            {loading ? <div className="text-[#00fff7]">Loading reviews...</div> :
              reviews.length === 0 ? <div className="text-[#a084ff]">No reviews yet.</div> :
              <ul className="space-y-2">
                {reviews.map((r, i) => (
                  <li key={i} className="bg-[#181c2b] border border-[#ff00c8] rounded-xl p-3 text-[#eaf6fb]">
                    <div className="text-base text-[#00fff7] mb-1">{r.review}</div>
                    {r.displayName && <div className="text-xs text-[#ff00c8] font-bold mb-1">— {r.displayName}</div>}
                    <div className="text-xs text-[#a084ff]">Submitted {r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</div>
                  </li>
                ))}
              </ul>
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Puddy Pictures</title>
      </Head>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181c2b] to-[#2a1a3a] text-[#eaf6fb] font-retro">
        <nav className="w-full flex items-center justify-between px-8 py-4 bg-[#23243a]/90 shadow-lg z-10 border-b-4 border-[#00fff7]">
          <div className="flex items-center gap-3">
            <img src="/globe.svg" alt="Puddy Pictures Logo" className="h-10 w-10 animate-spin-slow" />
            <span className="text-3xl font-extrabold tracking-tight text-[#00fff7] font-retro italic" style={{letterSpacing:'-1px'}}>Puddy Pictures</span>
          </div>
          <div className="flex gap-8 text-lg">
            <a href="/" className="hover:text-[#ff00c8] transition font-semibold">Home</a>
            <a href="/privacy" className="hover:text-[#ff00c8] transition font-semibold">Privacy</a>
            <a href="/terms" className="hover:text-[#ff00c8] transition font-semibold">Terms</a>
            <a href="/signup" className="hover:text-[#ff00c8] transition font-semibold">Sign Up</a>
          </div>
        </nav>
        <section className="flex flex-col items-center justify-center flex-1 py-14 px-4 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-4 text-[#00fff7] font-retro italic tracking-tight" style={{letterSpacing:'-2px'}}>Discover Your Next Movie</h1>
          <p className="text-2xl md:text-3xl text-[#eaf6fb]/90 mb-10 max-w-2xl mx-auto font-retro" style={{textShadow:'0 1px 0 #00fff7'}}>Let Puddy Pictures Picker surprise you with a film from around the world. Spin the wheels, get a random pick, and start watching!</p>
          {/* Button Group for Picker/Club */}
          <div className="flex justify-center mb-10 w-full max-w-2xl mx-auto gap-6">
            <button
              className={`px-8 py-4 text-2xl font-retro font-extrabold rounded-2xl border-4 transition-all duration-200 focus:outline-none shadow-lg ${activeTab === 'picker' ? 'bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] border-[#00fff7] scale-105' : 'bg-[#181c2b] text-[#a084ff] border-[#23243a] hover:bg-[#23243a] hover:text-[#00fff7]'}`}
              onClick={() => setActiveTab('picker')}
            >
              🎲 Random Movie Picker
            </button>
            <button
              className={`px-8 py-4 text-2xl font-retro font-extrabold rounded-2xl border-4 transition-all duration-200 focus:outline-none shadow-lg ${activeTab === 'club' ? 'bg-gradient-to-r from-[#ff00c8] to-[#00fff7] text-[#23243a] border-[#ff00c8] scale-105' : 'bg-[#181c2b] text-[#a084ff] border-[#23243a] hover:bg-[#23243a] hover:text-[#ff00c8]'}`}
              onClick={() => setActiveTab('club')}
            >
              🌟 Weekly Movie Club Pick
            </button>
          </div>
          {/* Button Content */}
          {activeTab === 'picker' && (
            <div className="w-full">
              {/* Filter Controls */}
              <div className="w-full max-w-5xl mx-auto mb-8 p-6 bg-[#23243a] border-2 border-[#00fff7] rounded-2xl overflow-x-auto">
                <h3 className="text-2xl font-bold text-[#00fff7] mb-4 font-retro">Filter Randomization Pool</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 min-w-[700px]">
                  {order.map((type) => (
                    <div key={type} className="bg-[#1a2233] rounded-xl p-4 border-2 border-[#23243a] flex flex-col mb-2">
                      <div className="font-bold text-[#00fff7] mb-3 uppercase tracking-wider text-lg text-center">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                      <div
                        className="flex flex-col gap-1"
                        style={{wordBreak:'break-word',maxWidth:'100%'}}
                      >
                        {(type === 'budget' ? wheels.budget : [...wheels[type]].sort()).map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-2 text-[#eaf6fb] text-base cursor-pointer px-1 py-0.5 rounded hover:bg-[#23243a] transition"
                            style={{minHeight:'2rem',overflowWrap:'anywhere',maxWidth:'100%'}}
                          >
                            <input
                              type="checkbox"
                              checked={filters[type].has(option)}
                              onChange={() => handleFilterChange(type, option)}
                              className="accent-[#00fff7]"
                              style={{width:'1.15rem',height:'1.15rem',minWidth:'1.15rem',minHeight:'1.15rem',margin:0,verticalAlign:'middle'}}
                            />
                            <span style={{fontSize:'1rem',lineHeight:'1.15rem',display:'inline-block',minHeight:'1.15rem',wordBreak:'break-word',maxWidth:'100%'}}>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-[#a084ff] mt-4 text-center">Uncheck any options you want to exclude from the random picker.</div>
              </div>
              {/* Picker UI (was previously here) */}
              {!showResult && (
                <div className="w-full max-w-5xl mx-auto bg-[#23243a]/95 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-10 flex flex-col items-center gap-8 animate-glow overflow-x-auto">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full min-w-[700px]">
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
                      {spinning ? "Spinning..." : "Spin for Movie"}
                    </button>
                  </div>
                  <div className="mt-4 text-xl text-[#00fff7] min-h-[40px] w-full text-center font-retro tracking-wider">
                    {spinResults.map((r, i) => (
                      <p key={i}>{r}</p>
                    ))}
                  </div>
                </div>
              )}
              {showResult && result && (
                <>
                  <div className="w-full max-w-5xl mx-auto bg-[#23243a]/98 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-12 flex flex-col md:flex-row gap-14 items-center mt-10 animate-fade-in min-h-[520px] min-w-[340px] md:min-h-[600px] md:min-w-[900px]">
                    {/* Poster Area */}
                    <div className="flex-[1.2] flex justify-center items-center">
                      {result.poster_url && (
                        <img
                          src={result.poster_url}
                          alt={result.title}
                          className="rounded-2xl shadow-2xl max-w-[420px] max-h-[80vh] border-4 border-[#00fff7] bg-[#1a2233]"
                          style={{boxShadow:'0 4px 32px #00fff7', width: '100%', height: 'auto', objectFit: 'cover'}} />
                      )}
                    </div>
                    {/* Info Area */}
                    <div className="flex-[2] flex flex-col justify-center items-start p-2 md:p-6 bg-[#23243a]/80 rounded-2xl border-2 border-[#00fff7] min-h-[420px] w-full">
                      <h2 className="text-5xl mb-4 font-extrabold text-[#00fff7] font-retro italic tracking-tight" style={{letterSpacing:'-1px',textShadow:'0 1px 0 #fff, 2px 2px 0 #00fff7'}}>
                        {result.title} <span className="text-3xl text-[#fffbe7] font-normal">({result.release_year})</span>
                      </h2>
                      <p className="mb-6 text-lg text-[#00fff7] font-bold">Description:<span className="text-[#f3ede7] font-normal ml-2">{result.description}</span></p>
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
                    </div>
                  </div>
                  <div className="w-full flex justify-center mt-8">
                    <button
                      className="text-2xl px-10 py-3 bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] font-extrabold rounded-full shadow-lg hover:from-[#ff00c8] hover:to-[#00fff7] transition font-retro border-2 border-[#00fff7]"
                      onClick={resetAll}
                    >
                      Try Another
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === 'club' && (
            <div className="w-full">
              <WeeklyMoviePublicHomePreloaded movie={weeklyMovie} reviews={weeklyReviews} loading={weeklyLoading} />
              <PreviousWeeklyMovies />
            </div>
          )}
        </section>
        <footer className="w-full bg-[#23243a]/95 border-t-4 border-[#00fff7] text-center py-4 text-lg text-[#00fff7] mt-auto font-retro">
          <a href="/privacy" className="font-bold hover:underline mx-2">Privacy Policy</a> |
          <a href="/terms" className="font-bold hover:underline mx-2">Terms</a> |
          <a href="/signup" className="font-bold hover:underline mx-2">Sign Up</a>
          <span className="mx-2">|</span>
          <Link href="/admin" className="mx-2" style={{ fontSize: '0.95em', opacity: 0.5, textDecoration: 'underline' }}>Admin</Link>
        </footer>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=IBM+Plex+Sans:wght@400;700&display=swap');
          .font-retro {
            font-family: 'Orbitron', 'IBM Plex Sans', Arial, sans-serif;
          }
          .animate-glow {
            box-shadow: 0 0 16px 4px #00fff7, 0 0 32px 8px #ff00c8;
            animation: glowPulse 2.5s infinite alternate;
          }
          @keyframes glowPulse {
            0% { box-shadow: 0 0 16px 4px #00fff7, 0 0 32px 8px #ff00c8; }
            100% { box-shadow: 0 0 32px 8px #ff00c8, 0 0 48px 16px #00fff7; }
          }
          .animate-spin-slow {
            animation: spin 8s linear infinite;
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
          .animate-bounce {
            animation: bounce 1.2s infinite alternate;
          }
          @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-10px); }
          }
          .animate-confetti {
            background: repeating-linear-gradient(90deg, #00fff7 0 10px, #ff00c8 10px 20px, #3a7bff 20px 30px, #a084ff 30px 40px);
            background-size: 80px 60px;
            animation: confettiMove 1.5s linear infinite;
          }
          @keyframes confettiMove {
            0% { background-position-x: 0; }
            100% { background-position-x: 80px; }
          }
          .tab-active {
            box-shadow: 0 0 16px 4px #00fff7, 0 0 32px 8px #ff00c8;
          }
        `}</style>
      </div>
    </>
  );
}
