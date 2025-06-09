// Admin Login Page
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check password via API route
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      // Set cookie and redirect
      router.replace(redirect);
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181c2b] text-[#eaf6fb] font-retro">
      <form onSubmit={handleSubmit} className="bg-[#23243a] border-4 border-[#00fff7] rounded-3xl p-10 flex flex-col gap-6 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-extrabold text-[#00fff7] mb-2">Admin Login</h1>
        <input
          type="password"
          className="p-4 rounded-xl border-2 border-[#00fff7] bg-[#1a2233] text-lg text-[#eaf6fb] font-mono"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-[#ff00c8] font-bold">{error}</div>}
        <button type="submit" className="py-3 px-8 bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] font-bold rounded-xl shadow-lg text-xl hover:from-[#ff00c8] hover:to-[#00fff7] transition">Login</button>
      </form>
    </div>
  );
}
