"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type EventListItem = {
  id: string;
  clubSlug: string;
  name: string;
  startsAt: string;
  venue: string;
  city?: string;
  visibility: "public" | "private";
  maxPlayers?: number | null;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    (async () => {
      const { data } = await supabase
        .from("events")
        .select("id, name, starts_at, venue, visibility, max_players, clubs ( slug )")
        .order("starts_at", { ascending: true })
        .gte("starts_at", new Date().toISOString());
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        clubSlug: row.clubs?.slug ?? "",
        name: row.name,
        startsAt: row.starts_at,
        venue: row.venue,
        visibility: row.visibility,
        maxPlayers: row.max_players,
      }));
      setEvents(mapped);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Upcoming events</h1>
        <Link href="/clubs" className="text-sm text-zinc-700 dark:text-zinc-300 hover:underline">Create event via your club →</Link>
      </div>
      {loading ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-zinc-600 dark:text-zinc-400">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-zinc-600 dark:text-zinc-400">
          No upcoming events yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((ev) => (
            <li key={ev.id} className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-4 bg-white/60 dark:bg-zinc-950/50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">{ev.name}</h3>
                  <p className="text-xs text-zinc-500">{format(new Date(ev.startsAt), "EEE, MMM d • p")} • {ev.venue}</p>
                </div>
                <Link href={`/clubs/${ev.clubSlug}`} className="text-sm hover:underline">View club</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


