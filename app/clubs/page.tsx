"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type Club = {
  id: string;
  name: string;
  slug: string;
  city: string;
  visibility: "public" | "private" | "hidden";
  description?: string | null;
};

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    (async () => {
      const { data } = await supabase
        .from("clubs")
        .select("id, name, slug, city, visibility, description")
        .order("name", { ascending: true });
      setClubs(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Clubs</h1>
        <Link href="/clubs/new" className="inline-flex items-center justify-center rounded-lg bg-zinc-900 text-white px-3 py-2 text-sm font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">Create club</Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-zinc-600 dark:text-zinc-400">
          Loading clubs...
        </div>
      ) : clubs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-zinc-600 dark:text-zinc-400">
          No clubs yet. Create your first club.
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <li key={club.id} className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-4 bg-white/60 dark:bg-zinc-950/50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium"><Link href={`/clubs/${club.slug}`}>{club.name}</Link></h3>
                  <p className="text-xs text-zinc-500">{club.city} • {club.visibility}</p>
                </div>
                <Link href={`/clubs/${club.slug}`} className="text-sm text-zinc-700 dark:text-zinc-300 hover:underline">Open</Link>
              </div>
              {club.description ? (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">{club.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


