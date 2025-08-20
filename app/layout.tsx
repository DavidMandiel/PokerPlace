import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "./components/Navigation";
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
        <Navigation />
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
