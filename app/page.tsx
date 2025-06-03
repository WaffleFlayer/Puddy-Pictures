'use client';

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

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

  // Helper to spin a wheel (simulate random selection)
  const spinWheel = (type: PickerType) => {
    return new Promise<void>((resolve) => {
      const options = wheels[type];
      const choice = options[Math.floor(Math.random() * options.length)];
      setSelections((prev) => ({ ...prev, [type]: choice }));
      setTimeout(resolve, 500); // Simulate spin delay
    });
  };

  // Generate a unique code for the movie (e.g., 6-char alphanumeric)
  function generateMovieCode(title: string, year: string) {
    // Simple hash: first 3 letters of title (no spaces), last 2 digits of year, random digit
    const clean = title.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const code = (clean.slice(0, 3) + (year.slice(-2)) + Math.floor(Math.random() * 10)).padEnd(6, 'X');
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

  // Main sequence
  const runSequence = async () => {
    setSpinning(true);
    setSpinResults([]);
    setShowResult(false);
    setError("");
    let newSelections: Selections = {};
    let newResults: string[] = [];
    // Spin each wheel and update selections and results
    for (const type of order) {
      const options = wheels[type];
      const choice = options[Math.floor(Math.random() * options.length)];
      newSelections = { ...newSelections, [type]: choice };
      setSelections((prev) => ({ ...prev, [type]: choice }));
      newResults.push(
        `${type.charAt(0).toUpperCase() + type.slice(1)}: ${choice}`
      );
      setSpinResults([...newResults]);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate spin delay
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
            {/* Picker UI (was previously here) */}
            {!showResult && (
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
                    {spinning ? "Spinning..." : "Start Random Movie"}
                  </button>
                  <button
                    className="text-2xl px-10 py-3 bg-[#1a2233] border-2 border-[#00fff7] text-[#00fff7] font-extrabold rounded-full shadow hover:bg-[#23243a] transition font-retro"
                    onClick={resetAll}
                    disabled={spinning}
                  >
                    Reset
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
                <button
                  className="text-2xl px-10 py-3 bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] font-extrabold rounded-full shadow-lg hover:from-[#ff00c8] hover:to-[#00fff7] transition mt-6 md:mt-0 md:absolute md:bottom-8 md:right-8 font-retro border-2 border-[#00fff7]"
                  onClick={resetAll}
                >
                  Try Another
                </button>
              </div>
            )}
          </div>
        )}
        {activeTab === 'club' && (
          <div className="w-full">
            <WeeklyMoviePublicHomePreloaded movie={weeklyMovie} reviews={weeklyReviews} loading={weeklyLoading} />
          </div>
        )}
      </section>
      <footer className="w-full bg-[#23243a]/95 border-t-4 border-[#00fff7] text-center py-4 text-lg text-[#00fff7] mt-auto font-retro">
        <a href="/privacy" className="font-bold hover:underline mx-2">Privacy Policy</a> |
        <a href="/terms" className="font-bold hover:underline mx-2">Terms</a> |
        <a href="/signup" className="font-bold hover:underline mx-2">Sign Up</a>
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
  );
}
