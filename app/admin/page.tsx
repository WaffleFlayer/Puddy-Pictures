// Admin Home Page
'use client';
import Link from 'next/link';

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

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-[#181c2b] text-[#eaf6fb] flex flex-col items-center font-retro">
      <AdminNav />
      <main className="flex-1 flex flex-col items-center justify-center w-full p-8">
        <h1 className="text-4xl font-extrabold text-[#00fff7] mb-10">Admin Dashboard</h1>
        <div className="flex flex-col gap-6 w-full max-w-md">
          <Link href="/weekly-movie-page">
            <button className="w-full py-4 px-6 bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] font-bold rounded-xl shadow-lg text-2xl hover:from-[#ff00c8] hover:to-[#00fff7] transition">Weekly Movie Admin</button>
          </Link>
          <Link href="/admin-subscribers">
            <button className="w-full py-4 px-6 bg-gradient-to-r from-[#ff00c8] to-[#00fff7] text-[#23243a] font-bold rounded-xl shadow-lg text-2xl hover:from-[#00fff7] hover:to-[#ff00c8] transition">Subscribers Admin</button>
          </Link>
          <Link href="/export-registrations">
            <button className="w-full py-4 px-6 bg-gradient-to-r from-[#00fff7] to-[#ff00c8] text-[#23243a] font-bold rounded-xl shadow-lg text-2xl hover:from-[#ff00c8] hover:to-[#00fff7] transition">Export Registrations</button>
          </Link>
        </div>
      </main>
      <AdminFooter />
    </div>
  );
}
