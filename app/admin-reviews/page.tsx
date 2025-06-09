// Admin page to view and remove received reviews
'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin-reviews')
      .then(r => r.ok ? r.json() : Promise.reject('Failed to fetch'))
      .then(setReviews)
      .catch(() => setError('Failed to load reviews.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setRemoving(id);
    const res = await fetch('/api/admin-reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      setReviews(reviews.filter(r => r.id !== id));
    } else {
      alert('Failed to delete review.');
    }
    setRemoving(null);
  };

  return (
    <div className="min-h-screen bg-[#181c2b] text-[#eaf6fb] p-8 font-retro">
      <Head>
        <title>Admin Reviews | Puddy Pictures</title>
      </Head>
      <header className="mb-8 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-[#00fff7] mb-2">Admin: Reviews</h1>
        <nav className="flex gap-6 mt-2">
          <Link href="/admin" className="text-lg font-bold text-[#ff00c8] hover:text-[#00fff7]">Admin Home</Link>
          <Link href="/admin-subscribers" className="text-lg font-bold text-[#ff00c8] hover:text-[#00fff7]">Subscribers</Link>
          <Link href="/weekly-movie-page" className="text-lg font-bold text-[#ff00c8] hover:text-[#00fff7]">Weekly Movie</Link>
        </nav>
      </header>
      <div className="max-w-4xl mx-auto bg-[#23243a] border-4 border-[#00fff7] rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-[#ff00c8] mb-4">Received Reviews</h2>
        {loading ? <div className="text-[#00fff7]">Loading...</div> : error ? <div className="text-[#ff00c8]">{error}</div> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[#00fff7] border-b-2 border-[#00fff7]">
                <th className="p-2">ID</th>
                <th className="p-2">Code</th>
                <th className="p-2">Display Name</th>
                <th className="p-2">Review</th>
                <th className="p-2">Timestamp</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id} className="border-b border-[#23243a] hover:bg-[#1a2233]">
                  <td className="p-2 font-mono text-xs">{r.id}</td>
                  <td className="p-2 font-mono">{r.code}</td>
                  <td className="p-2">{r.displayName || r.displayname || <span className="italic text-[#a084ff]">(none)</span>}</td>
                  <td className="p-2 max-w-xs break-words">{r.review}</td>
                  <td className="p-2 text-xs">{r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</td>
                  <td className="p-2">
                    <button
                      className="px-3 py-1 bg-[#ff00c8] text-[#fffbe7] rounded font-bold hover:bg-[#a084ff] transition"
                      disabled={removing === r.id}
                      onClick={() => handleRemove(r.id)}
                    >
                      {removing === r.id ? 'Removing...' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
