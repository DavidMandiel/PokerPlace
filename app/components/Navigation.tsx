"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { LogOut } from "lucide-react";
import Image from "next/image";
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
    <div className="sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between h-20 px-8">
        <Link href="/" className="flex-shrink-0 mr-12 -ml-5">
          <Image 
            src="/icon-app.png" 
            alt="PokerPlace" 
            width={64} 
            height={64} 
            className="w-16 h-16"
          />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/clubs" className="text-emerald-mint/90 hover:text-emerald-mint hover:underline underline-offset-4 whitespace-nowrap">Clubs</Link>
          
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="text-emerald-mint/90 hover:text-emerald-mint hover:underline underline-offset-4 whitespace-nowrap">Dashboard</Link>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 text-emerald-mint/90 hover:text-emerald-mint hover:underline underline-offset-4 whitespace-nowrap"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <Link href="/auth" className="text-emerald-mint/90 hover:text-emerald-mint hover:underline underline-offset-4 whitespace-nowrap">Sign in</Link>
              )}
            </>
          )}
          
          <a href="#disclaimer" className="text-emerald-mint/60 hover:text-emerald-mint whitespace-nowrap ml-4">Disclaimer</a>
        </div>
      </nav>
    </div>
  );
}
