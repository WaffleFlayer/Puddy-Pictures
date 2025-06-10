import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Puddy Pictures",
  description: "Puddy Pictures Movie Club - Weekly movie picks and reviews",
  icons: {
    icon: "/puddy%20logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/puddy%20logo.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="w-full flex items-center px-8 py-4 bg-[#23243a]/90 shadow-lg z-20 border-b-4 border-[#00fff7]">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            style={{ textDecoration: "none" }}
          >
            <img
              src="/puddy%20logo.svg"
              alt="Puddy Pictures Logo"
              className="h-12 w-12 drop-shadow-lg transition-transform group-hover:scale-105"
              style={{ borderRadius: "50%" }}
            />
            <span
              className="text-3xl font-extrabold tracking-tight text-[#00fff7] font-retro italic"
              style={{ letterSpacing: "-1px" }}
            >
              Puddy Pictures
            </span>
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
