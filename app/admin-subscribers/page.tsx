// Admin Subscribers Page
'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Registration {
  name: string;
  displayName?: string;
  displayname?: string; // Add this line
  phone: string;
  consent: boolean;
  date: string;
  unsubscribed?: boolean;
  unsubscribedDate?: string;
}

function AdminNav() {
  return (
    <header className="w-full flex flex-col items-center py-6 bg-gradient-to-r from-[#181c2b] via-[#23243a] to-[#181c2b] shadow-lg border-b-4 border-[#00fff7] mb-10">
      <nav className="flex flex-wrap gap-8 justify-center items-center">
        <Link href="/" className="text-2xl font-extrabold text-[#00fff7] hover:text-[#ff00c8] transition">Public Home</Link>
        <Link href="/admin" className="text-2xl font-extrabold text-[#00fff7] hover:text-[#ff00c8] transition">Admin Home</Link>
        <Link href="/weekly-movie-page" className="text-2xl font-extrabold text-[#00fff7] hover:text-[#ff00c8] transition">Weekly Movie</Link>
        <Link href="/admin-subscribers" className="text-2xl font-extrabold text-[#00fff7] hover:text-[#ff00c8] transition">Subscribers</Link>
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
        <Link href="/export-registrations" className="text-lg font-bold text-[#ff00c8] hover:text-[#00fff7] transition">Export</Link>
      </nav>
      <div className="mt-4 text-xs text-[#a084ff]">&copy; {new Date().getFullYear()} Puddy Pictures Admin</div>
    </footer>
  );
}

export default function AdminSubscribers() {
  const [subs, setSubs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Remove password logic from fetchWithPassword
  const fetchWithPassword = async (url: string, options: any = {}) => {
    return fetch(url, options);
  };

  // Fetch subscribers with password header after login
  useEffect(() => {
    setLoading(true);
    fetchWithPassword('/api/admin-subscribers')
      .then(async r => {
        if (!r.ok) throw new Error('Unauthorized or error');
        return r.json();
      })
      .then(data => {
        // Map displayname (lowercase) to displayName for all subs
        setSubs(data.map((s: any) => ({
          ...s,
          displayName: s.displayName || s.displayname || '',
        })));
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load subscribers.');
        setLoading(false);
      });
  }, []);

  // Remove sessionStorage password logic
  useEffect(() => {
    // No-op: password logic removed
  }, []);

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

  return (
    <>
      <Head>
        <title>Puddy Pictures</title>
      </Head>
      <div className="min-h-screen bg-[#181c2b] text-[#eaf6fb] font-retro">
        <AdminNav />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-extrabold text-[#00fff7] mb-6">Movie Club Subscribers</h1>
          <div className="mb-6 w-full flex justify-end">
            <button
              className="px-6 py-2 bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] font-bold rounded shadow border-2 border-[#00fff7] text-lg hover:from-[#ff00c8] hover:to-[#00fff7] transition"
              onClick={async () => {
                try {
                  const res = await fetch('/api/export-registrations');
                  if (!res.ok) {
                    alert('Server error while exporting subscribers.');
                    return;
                  }
                  const data = await res.json();
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'subscribers.json';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch {
                  alert('Failed to export subscribers.');
                }
              }}
            >
              Export Subscribers (JSON)
            </button>
          </div>
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
                    <td className="p-2 overflow-hidden text-ellipsis max-w-[140px]">{s.displayName || s.displayname || ''}</td>
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
        <AdminFooter />
      </div>
    </>
  );
}
