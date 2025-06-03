'use client';

export default function Privacy() {
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
      {/* Main Privacy Content - wrap in neon card */}
      <section className="flex flex-col items-center justify-center flex-1 py-14 px-4 text-center">
        <div className="w-full max-w-2xl mx-auto bg-[#23243a]/95 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-10 flex flex-col items-center gap-8 animate-glow">
          <h1 className="text-5xl font-extrabold mb-6 text-[#00fff7] font-retro italic tracking-tight" style={{letterSpacing:'-1px',textShadow:'0 1px 0 #fff, 2px 2px 0 #00fff7'}}>Privacy Policy</h1>
          <div className="text-left text-lg text-[#f3ede7] font-retro space-y-6 w-full">
            <p className="mb-2"><strong>Last Updated:</strong> June 2, 2025</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Introduction</h2>
            <p className="mb-4">Puddy Pictures Movie Club ("we", "our", "us") is committed to protecting your privacy. This policy explains how we handle your personal information.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Information We Collect</h2>
            <p className="mb-4">We collect your name and phone number when you voluntarily sign up for weekly movie recommendations through SMS/MMS.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
            <ul className="list-disc list-inside mb-4">
              <li>Send weekly movie recommendations via SMS/MMS.</li>
              <li>Manage your subscription status.</li>
              <li>Respond to inquiries or requests.</li>
            </ul>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Sharing Information</h2>
            <p className="mb-4">We do not sell or share your information with third parties for marketing or promotional purposes. We may only share your information with trusted service providers to deliver messaging services, who are obligated to protect your privacy.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Opt-out</h2>
            <p className="mb-4">You can unsubscribe at any time by replying STOP to our messages.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Data Security</h2>
            <p className="mb-4">We implement reasonable security measures to protect your information from unauthorized access or misuse.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Changes to This Policy</h2>
            <p className="mb-4">We may periodically update this policy. Changes will be posted here with an updated effective date.</p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Contact</h2>
            <p className="mb-4">If you have any questions or concerns about this Privacy Policy or our practices, please contact us at <a href="mailto:contact@puddypictures.club" className="text-[#00fff7] underline">contact@puddypictures.club</a>.</p>
          </div>
        </div>
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
      `}</style>
    </div>
  );
}
