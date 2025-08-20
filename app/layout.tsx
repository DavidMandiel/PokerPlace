import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokerPlace – Organize Poker Events and Clubs",
  description: "Beautiful, simple event organizing and social hub for poker clubs and players. No real-money transactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 min-h-screen text-zinc-900 dark:text-zinc-100`}>
        <div className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
            <Link href="/" className="font-semibold tracking-tight text-lg">PokerPlace</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/clubs" className="hover:underline underline-offset-4">Clubs</Link>
              <Link href="/auth" className="hover:underline underline-offset-4">Sign in</Link>
              <a href="#disclaimer" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Disclaimer</a>
            </div>
          </nav>
        </div>
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer id="disclaimer" className="mt-12 border-t border-zinc-200/80 dark:border-zinc-800 py-6">
          <div className="max-w-6xl mx-auto px-4 text-xs text-zinc-600 dark:text-zinc-400">
            <p className="mb-1">No gambling or real-money transactions. This app is for organizational and social purposes only.</p>
            <p>© {new Date().getFullYear()} PokerPlace</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
