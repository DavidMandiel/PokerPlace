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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen text-white overflow-hidden`}>
        <Navigation />
        <main className="h-[calc(80vh-5rem)] overflow-y-auto flex items-start justify-center">
          <div className="w-full max-w-4xl pl-6 pr-10 pb-1">
            {children}
          </div>
        </main>
        <footer id="disclaimer" className="border-t border-emerald/20 py-4 bg-brand-bg1/50">
          <div className="max-w-6xl mx-auto pl-6 pr-10 text-xs text-emerald-mint/80">
            <p className="mb-1">No gambling or real-money transactions. This app is for organizational and social purposes only.</p>
            <p>© {new Date().getFullYear()} PokerPlace</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
