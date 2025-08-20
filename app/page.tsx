import Link from "next/link";

export default function Home() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-6 bg-white/60 dark:bg-zinc-950/50 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to PokerPlace</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Organize poker clubs and events, track attendance and results, and connect with players. No real-money transactions.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/clubs" className="inline-flex items-center justify-center rounded-lg bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">Explore Clubs</Link>
          <Link href="/events" className="inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">Upcoming Events</Link>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-6 bg-white/60 dark:bg-zinc-950/50 shadow-sm">
        <h2 className="text-xl font-medium">Quick stats</h2>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-4">
            <div className="text-2xl font-semibold">0</div>
            <div className="text-xs text-zinc-500">Clubs</div>
          </div>
          <div className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-4">
            <div className="text-2xl font-semibold">0</div>
            <div className="text-xs text-zinc-500">Events</div>
          </div>
          <div className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-4">
            <div className="text-2xl font-semibold">0</div>
            <div className="text-xs text-zinc-500">Players</div>
          </div>
        </div>
      </section>
    </div>
  );
}
