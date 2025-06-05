// Admin Subscribers Page
'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';

interface Registration {
  name: string;
  displayName?: string;
  phone: string;
  consent: boolean;
  date: string;
  unsubscribed?: boolean;
  unsubscribedDate?: string;
}

export default function AdminSubscribers() {
  const [subs, setSubs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password protection state
  const [pw, setPw] = useState("");
  const [pwOk, setPwOk] = useState(false);
  const [pwError, setPwError] = useState("");

  // Helper to fetch with admin password header
  const fetchWithPassword = async (url: string, options: any = {}) => {
    const headers = options.headers || {};
    headers['x-admin-password'] = pw;
    options.headers = headers;
    return fetch(url, options);
  };

  // Fetch subscribers with password header after login
  useEffect(() => {
    if (!pwOk) return;
    setLoading(true);
    fetchWithPassword('/api/admin-subscribers')
      .then(async r => {
        if (!r.ok) throw new Error('Unauthorized or error');
        return r.json();
      })
      .then(data => {
        setSubs(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load subscribers.');
        setLoading(false);
      });
  }, [pwOk]);

  // On mount, check for saved admin_pw in sessionStorage
  useEffect(() => {
    const savedPw = sessionStorage.getItem('admin_pw');
    if (savedPw) {
      setPw(savedPw);
      setPwOk(true);
    }
  }, []);

  // When pwOk and pw are set, save to sessionStorage
  useEffect(() => {
    if (pwOk && pw) {
      sessionStorage.setItem('admin_pw', pw);
    }
  }, [pwOk, pw]);

  const handleDelete = async (phone: string) => {
    if (!window.confirm('Are you sure you want to remove this subscriber?')) return;
    const res = await fetchWithPassword('/api/admin-subscribers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (res.ok) {
      setSubs(subs => subs.filter(s => s.phone !== phone));
    } else {
      alert('Failed to remove subscriber.');
    }
  };

  // CSV export helper
  const exportCSV = () => {
    if (!subs.length) return;
    const header = ['Name', 'Display Name', 'Phone', 'Consent', 'Date', 'Status'];
    const rows = subs.map(s => [
      '"' + (s.name || '').replace(/"/g, '""') + '"',
      '"' + (s.displayName || '').replace(/"/g, '""') + '"',
      '"' + (s.phone || '').replace(/"/g, '""') + '"',
      s.consent ? 'Yes' : 'No',
      '"' + (new Date(s.date).toLocaleString()) + '"',
      s.unsubscribed ? 'Unsubscribed' : 'Active',
    ]);
    const csvContent = [header, ...rows].map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!pwOk) {
    const tryPassword = async () => {
      try {
        const res = await fetchWithPassword('/api/admin-subscribers');
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

  return (
    <>
      <Head>
        <title>Puddy Pictures</title>
      </Head>
      <div className="min-h-screen bg-[#181c2b] text-[#eaf6fb] p-8 font-retro flex flex-col items-center">
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
            <a href="/weekly-movie-page" className="hover:text-[#ff00c8] transition font-semibold">Weekly Movie Roll Admin</a>
          </div>
        </nav>
        <h1 className="text-4xl font-extrabold text-[#00fff7] mb-6">Movie Club Subscribers</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-[#ff00c8]">{error}</div>}
        {!loading && !error && (
          <table className="w-full max-w-2xl bg-[#23243a] border-4 border-[#00fff7] rounded-2xl shadow-xl">
            <thead>
              <tr className="text-left text-[#00fff7] border-b-2 border-[#00fff7]">
                <th className="p-3">Name</th>
                <th className="p-3">Display Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Consent</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={i} className={`border-b border-[#23243a] hover:bg-[#1a2233] whitespace-nowrap ${s.unsubscribed ? 'opacity-50' : ''}`}>
                  <td className="p-2 overflow-hidden text-ellipsis max-w-[180px]">{s.name}</td>
                  <td className="p-2 overflow-hidden text-ellipsis max-w-[140px]">{s.displayName || ''}</td>
                  <td className="p-2 overflow-hidden text-ellipsis max-w-[140px]">{s.phone}</td>
                  <td className="p-2">{s.consent ? 'Yes' : 'No'}</td>
                  <td className="p-2 overflow-hidden text-ellipsis max-w-[180px]">{new Date(s.date).toLocaleString()}</td>
                  <td className="p-2">{s.unsubscribed ? `Unsubscribed${s.unsubscribedDate ? ' (' + new Date(s.unsubscribedDate).toLocaleDateString() + ')' : ''}` : 'Active'}</td>
                  <td className="p-2 text-right">
                    <button
                      className="px-3 py-1 bg-[#ff00c8] text-white rounded hover:bg-[#a084ff] text-xs font-bold transition"
                      onClick={() => handleDelete(s.phone)}
                      disabled={s.unsubscribed}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
