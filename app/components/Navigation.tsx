"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Home, Plus, Calendar, MapPin, Bell, LogOut } from "lucide-react";
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

  // If not logged in, show minimal header
  if (!user) {
    return (
      <div className="sticky top-0 z-50 bg-emerald-dark/50 border-b border-emerald-mint/20">
        <nav className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/icon-app.png" 
              alt="PokerPlace" 
              width={40} 
              height={40} 
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-gradient">PokerPlace</span>
          </Link>
          <Link href="/auth" className="btn-accent rounded-xl px-4 py-2">
            Sign in
          </Link>
        </nav>
      </div>
    );
  }

  // For logged-in users, show bottom navigation
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-emerald-dark/90 border-t border-emerald-mint/20 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-around h-16 px-4">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-emerald-mintSoft hover:text-emerald-mint transition-colors">
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Link>
        
        <Link href="/events/new" className="flex flex-col items-center gap-1 text-emerald-mintSoft hover:text-emerald-mint transition-colors">
          <Plus className="w-5 h-5" />
          <span className="text-xs">Create</span>
        </Link>
        
        <Link href="/events" className="flex flex-col items-center gap-1 text-emerald-mintSoft hover:text-emerald-mint transition-colors">
          <Calendar className="w-5 h-5" />
          <span className="text-xs">Events</span>
        </Link>
        
        <Link href="/clubs" className="flex flex-col items-center gap-1 text-emerald-mintSoft hover:text-emerald-mint transition-colors">
          <MapPin className="w-5 h-5" />
          <span className="text-xs">Clubs</span>
        </Link>
        
        <button 
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 text-emerald-mintSoft hover:text-brand-red transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs">Sign out</span>
        </button>
      </nav>
    </div>
  );
}
