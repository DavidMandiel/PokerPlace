export default function EventDetailsPage() {
  // Placeholder static page for MVP shell
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Event</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Details, RSVP and chat will appear here.</p>
      <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-6 bg-white/60 dark:bg-zinc-950/50">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-zinc-500">Starts</div>
            <div className="font-medium">TBD</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Venue</div>
            <div className="font-medium">TBD</div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="inline-flex items-center justify-center rounded-lg bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">RSVP</button>
          <button className="inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">Add to calendar</button>
        </div>
      </div>
    </div>
  );
}



