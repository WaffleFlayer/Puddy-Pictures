'use client';

import { useState } from "react";
import Head from 'next/head';

// Format US phone number as (XXX) XXX-XXXX
function formatPhoneNumber(value: string) {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;
}

export default function Signup() {
  const [form, setForm] = useState({ name: "", displayName: "", phone: "", consent: false });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [checkingDisplayName, setCheckingDisplayName] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === "phone") {
      setForm((prev) => ({
        ...prev,
        phone: formatPhoneNumber(value),
      }));
    } else if (name === "displayName") {
      setForm((prev) => ({ ...prev, displayName: value }));
      setError("");
      if (value.trim()) {
        setCheckingDisplayName(true);
        try {
          // Check uniqueness via API
          const res = await fetch(`/api/register-user?displayName=${encodeURIComponent(value.trim())}`);
          if (!res.ok) throw new Error('Network error');
          const data = await res.json();
          if (data.taken) {
            setError("That display name is already taken. Please choose another.");
          }
        } catch (err) {
          setError("Could not check display name. Please try again.");
        } finally {
          setCheckingDisplayName(false);
        }
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.consent) {
      setError("You must consent to receive messages.");
      return;
    }
    if (checkingDisplayName) {
      setError("Please wait for display name check to finish.");
      return;
    }
    // Check again before submit
    if (form.displayName && form.displayName.trim()) {
      const res = await fetch(`/api/register-user?displayName=${encodeURIComponent(form.displayName.trim())}`);
      const data = await res.json();
      if (data.taken) {
        setError("That display name is already taken. Please choose another.");
        return;
      }
    }
    const rawPhone = form.phone.replace(/\D/g, "");
    try {
      const res = await fetch("/api/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          name: form.name,
          displayName: form.displayName,
          phone: rawPhone,
          consent: form.consent ? "yes" : "",
        }).toString(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (submitted) {
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
          <div className="w-full max-w-xl mx-auto bg-[#23243a]/95 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-10 flex flex-col items-center gap-8 animate-glow">
            <h1 className="text-5xl font-extrabold mb-6 text-[#00fff7] font-retro italic tracking-tight" style={{letterSpacing:'-1px',textShadow:'0 1px 0 #fff, 2px 2px 0 #00fff7'}}>Sign Up</h1>
            <p className="text-lg text-[#eaf6fb] mb-6 max-w-2xl mx-auto">
              <strong>Join the Puddy Pictures Movie Club!</strong> Each week, we spin the wheels to pick a surprise film from around the world—different genres, decades, and countries. Sign up to receive a fun MMS every Friday with the “Movie of the Week,” including a poster, description, and streaming info. Watch along, share your thoughts, and be part of a global movie adventure. It’s free, easy, and you can unsubscribe at any time. <br /><br />
              <span className="text-[#00fff7]">Ready to discover your next favorite film?</span>
            </p>
            <div className="flex flex-col items-center gap-4">
              <span className="text-3xl text-[#ff00c8] font-bold animate-bounce">🎉 Welcome to the Club! 🎉</span>
              <span className="text-lg text-[#a084ff]">You’re officially signed up for Movie of the Week!</span>
              <div className="mt-6 animate-confetti" style={{height:'60px'}}></div>
            </div>
          </div>
        </section>
        <footer className="w-full bg-[#23243a]/95 border-t-4 border-[#00fff7] text-center py-4 text-lg text-[#00fff7] mt-auto font-retro">
          <a href="/privacy" className="font-bold hover:underline mx-2">Privacy Policy</a> |
          <a href="/terms" className="font-bold hover:underline mx-2">Terms</a> |
          <a href="/signup" className="font-bold hover:underline mx-2">Sign Up</a>
          <span className="mx-2">|</span>
          <a href="/weekly-movie-page" className="mx-2" style={{ fontSize: '0.95em', opacity: 0.5, textDecoration: 'underline' }}>Admin</a>
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
        `}</style>
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
          <div className="w-full max-w-xl mx-auto bg-[#23243a]/95 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-10 flex flex-col items-center gap-8 animate-glow">
            <h1 className="text-5xl font-extrabold mb-6 text-[#00fff7] font-retro italic tracking-tight" style={{letterSpacing:'-1px',textShadow:'0 1px 0 #fff, 2px 2px 0 #00fff7'}}>Sign Up</h1>
            <p className="text-lg text-[#eaf6fb] mb-6 max-w-2xl mx-auto">
              <strong>Join the Puddy Pictures Movie Club!</strong> Each week, we spin the wheels to pick a surprise film from around the world—different genres, decades, and countries. Sign up to receive a fun MMS every Friday with the “Movie of the Week,” including a poster, description, and streaming info. Watch along, share your thoughts, and be part of a global movie adventure. It’s free, easy, and you can unsubscribe at any time. <br /><br />
              <span className="text-[#00fff7]">Ready to discover your next favorite film?</span>
            </p>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 text-left text-lg text-[#eaf6fb] font-retro">
              <label className="block">
                Name:<br />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Legal name (not shown)"
                  className="bg-[#181c2b] border-2 border-[#a084ff] rounded-xl px-4 py-3 text-lg text-[#eaf6fb] font-retro placeholder-[#bdbdbd] focus:outline-none focus:border-[#00fff7] w-full transition-shadow focus:shadow-[0_0_8px_2px_#00fff7]"
                />
              </label>
              <label className="block">
                Display Name:<br />
                <input
                  type="text"
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  required
                  placeholder="Bilbo Potter"
                  className="bg-[#181c2b] border-2 border-[#00fff7] rounded-xl px-4 py-3 text-lg text-[#eaf6fb] font-retro placeholder-[#bdbdbd] focus:outline-none focus:border-[#ff00c8] w-full transition-shadow focus:shadow-[0_0_8px_2px_#ff00c8]"
                />
                <span className="text-sm text-[#a084ff]">This name will be shown with your reviews.</span>
              </label>
              <label className="block">
                Phone:<br />
                <input
                  type="tel"
                  name="phone"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="bg-[#181c2b] border-2 border-[#a084ff] rounded-xl px-4 py-3 text-lg text-[#eaf6fb] font-retro placeholder-[#bdbdbd] focus:outline-none focus:border-[#00fff7] w-full transition-shadow focus:shadow-[0_0_8px_2px_#00fff7]"
                />
              </label>
              <div className="text-sm text-[#a084ff] mb-2">
                <strong>Puddy Pictures Movie Club Opt‐In:</strong><br />
                By checking this box, you agree to receive a weekly MMS (every Friday)
                from <strong>Puddy Pictures Movie Club</strong> that contains our “Movie of the Week”
                poster image and streaming information. Msg &amp; Data Rates May Apply.
                Reply <strong>STOP</strong> at any time to unsubscribe.
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="consent"
                  checked={form.consent}
                  onChange={handleChange}
                  required
                  className="w-5 h-5 accent-[#ff00c8]"
                />
                <span className="text-[#ff00c8]">Yes, I’d like to receive the weekly Movie-of-the-Week MMS from Puddy Pictures Movie Club.</span>
              </label>
              <div className="flex flex-col gap-1 mt-2 text-sm">
                <a href="/privacy" className="text-[#00fff7] underline hover:text-[#ff00c8]">Privacy Policy</a>
                <a href="/terms" className="text-[#00fff7] underline hover:text-[#ff00c8]">Terms of Service</a>
              </div>
              {error && <div className="text-[#ff00c8] text-lg animate-bounce">{error}</div>}
              <button
                type="submit"
                className="text-2xl px-8 py-3 bg-gradient-to-r from-[#00fff7] via-[#3a7bff] to-[#ff00c8] text-white rounded-lg shadow-lg hover:from-[#ff00c8] hover:to-[#00fff7] hover:scale-105 transition-all duration-200 font-bold animate-glow"
              >
                Join Movie Club
              </button>
            </form>
          </div>
        </section>
        <footer className="w-full bg-[#23243a]/95 border-t-4 border-[#00fff7] text-center py-4 text-lg text-[#00fff7] mt-auto font-retro">
          <a href="/privacy" className="font-bold hover:underline mx-2">Privacy Policy</a> |
          <a href="/terms" className="font-bold hover:underline mx-2">Terms</a> |
          <a href="/signup" className="font-bold hover:underline mx-2">Sign Up</a>
          <span className="mx-2">|</span>
          <a href="/weekly-movie-page" className="mx-2" style={{ fontSize: '0.95em', opacity: 0.5, textDecoration: 'underline' }}>Admin</a>
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
        `}</style>
      </div>
    </>
  );
}
