"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Home, Plus, Calendar, MapPin, Bell, User, LogOut } from "lucide-react";
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
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/icon-app.png" 
              alt="PokerPlace" 
              width={40} 
              height={40} 
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-gray-900">PokerPlace</span>
          </Link>
          <Link href="/auth" className="btn-primary">
            Sign in
          </Link>
        </nav>
      </div>
    );
  }

  // For logged-in users, show bottom navigation
  return (
    <div className="nav-bottom z-50">
      <Link href="/dashboard" className="nav-item">
        <Home className="w-5 h-5" />
        <span className="text-xs">Home</span>
      </Link>
      
      <Link href="/events/new" className="nav-item">
        <Plus className="w-5 h-5" />
        <span className="text-xs">Create</span>
      </Link>
      
      <Link href="/events" className="nav-item">
        <Calendar className="w-5 h-5" />
        <span className="text-xs">Events</span>
      </Link>
      
      <Link href="/clubs" className="nav-item">
        <MapPin className="w-5 h-5" />
        <span className="text-xs">Clubs</span>
      </Link>
      
      <Link href="/profile" className="nav-item">
        <User className="w-5 h-5" />
        <span className="text-xs">Profile</span>
      </Link>
    </div>
  );
}
