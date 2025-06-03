'use client';

export default function Terms() {
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
        <div className="w-full max-w-2xl mx-auto bg-[#23243a]/95 rounded-3xl shadow-2xl border-4 border-[#00fff7] p-10 flex flex-col items-center gap-8 animate-glow">
          <h1 className="text-5xl font-extrabold mb-6 text-[#00fff7] font-retro italic tracking-tight" style={{letterSpacing:'-1px',textShadow:'0 1px 0 #fff, 2px 2px 0 #00fff7'}}>Terms of Service</h1>
          <div className="text-left text-lg text-[#eaf6fb] font-retro space-y-4 w-full">
            <p><strong>Last Updated:</strong> June 2, 2025</p>
            <p>Welcome to Puddy Pictures Movie Club (“we”, “our”, “us”). These Terms of Service (“Terms”) govern your access to and use of our website at puddypictures.club and our services, including weekly movie picks sent by SMS/MMS.</p>
            <p>By using our website and signing up for our movie picks, you agree to these Terms.</p>
            <ol className="list-decimal list-inside space-y-2 mt-4">
              <li>
                <strong>Service Overview</strong><br />
                Puddy Pictures Movie Club offers weekly movie recommendations delivered via SMS/MMS to consenting subscribers. Participation is voluntary and subject to these Terms.
              </li>
              <li>
                <strong>Eligibility</strong><br />
                You must be at least 18 years old (or the age of majority in your jurisdiction) to use our services.
              </li>
              <li>
                <strong>User Consent</strong><br />
                By providing your phone number and checking the required box during signup, you agree to receive recurring SMS/MMS messages from us. Standard message and data rates may apply.<br />
                You can opt out at any time by replying STOP to our messages.
              </li>
              <li>
                <strong>Privacy</strong><br />
                We respect your privacy. Please review our Privacy Policy for information on how we collect and use your data.
              </li>
              <li>
                <strong>Content</strong><br />
                All content we share (movie titles, descriptions, posters) is for informational and entertainment purposes only.
              </li>
              <li>
                <strong>Modifications to Service</strong><br />
                We reserve the right to modify or discontinue the service at any time without notice.
              </li>
              <li>
                <strong>Limitation of Liability</strong><br />
                To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of our services.
              </li>
              <li>
                <strong>Governing Law</strong><br />
                These Terms are governed by the laws of the state of Utah. Any disputes will be resolved in the courts of Utah.
              </li>
              <li>
                <strong>Contact Us</strong><br />
                If you have questions about these Terms, please email us at <a href="mailto:contact@puddypictures.club" className="text-[#00fff7] underline">contact@puddypictures.club</a>.
              </li>
            </ol>
            <p>Thank you for being part of Puddy Pictures Movie Club!</p>
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
