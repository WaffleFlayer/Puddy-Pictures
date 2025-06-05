// Public page for members to view the current weekly movie and reviews
'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function WeeklyMoviePublicPage() {
  const [movie, setMovie] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weekly-movie')
      .then(r => r.json())
      .then(data => {
        setMovie(data);
        if (data && data.code) {
          fetch(`/api/get-reviews?code=${data.code}`)
            .then(r2 => r2.json())
            .then(setReviews)
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-[#181c2b] text-[#00fff7] flex items-center justify-center font-retro text-2xl">Loading...</div>;
  if (!movie || !movie.title) return <div className="min-h-screen bg-[#181c2b] text-[#ff00c8] flex items-center justify-center font-retro text-2xl">No weekly movie set.</div>;

  return (
    <>
      <Head>
        <title>Puddy Pictures</title>
      </Head>
      <div className="min-h-screen bg-[#181c2b] text-[#eaf6fb] p-8 font-retro flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-[#00fff7] mb-6">This Week's Movie</h1>
        <div className="p-8 bg-[#23243a] border-4 border-[#00fff7] rounded-3xl max-w-2xl w-full">
          <div className="text-3xl font-bold text-[#ff00c8] mb-2">{movie.title} <span className="text-lg text-[#fffbe7] font-normal">({movie.release_year})</span></div>
          <div className="mb-2 text-[#eaf6fb]">{movie.description}</div>
          <div className="mb-2 text-[#a084ff]">Review Code: <span className="font-mono">{movie.code}</span></div>
          <div className="mb-2 text-[#00fff7]">Reply to the club SMS with this code at the start of your review!</div>
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-[#ff00c8] mb-2">Reviews</h3>
            {reviews.length === 0 ? <div className="text-[#a084ff]">No reviews yet.</div> :
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
      </div>
    </>
  );
}
