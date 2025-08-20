"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { LogOut } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = SupabaseUser;

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/" className="font-semibold tracking-tight text-lg">PokerPlace</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/clubs" className="hover:underline underline-offset-4">Clubs</Link>
          
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="hover:underline underline-offset-4">Dashboard</Link>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 hover:underline underline-offset-4"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <Link href="/auth" className="hover:underline underline-offset-4">Sign in</Link>
              )}
            </>
          )}
          
          <a href="#disclaimer" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Disclaimer</a>
        </div>
      </nav>
    </div>
  );
}
