"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { slugify } from "@/lib/slug";

export default function NewClubPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "hidden">("public");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = getBrowserSupabaseClient();
    const slug = slugify(name);
    const { error } = await supabase.from("clubs").insert({ name, city, visibility, slug });
    setSubmitting(false);
    if (error) {
      alert(error.message);
    } else {
      router.push("/clubs");
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Create a club</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Set up your club to host events and manage members.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Downtown Poker Club" className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g., Tel Aviv" className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Visibility</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)} className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm">
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <button disabled={submitting} className="inline-flex items-center justify-center rounded-lg bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
          {submitting ? "Creating..." : "Create club"}
        </button>
      </form>
    </div>
  );
}


