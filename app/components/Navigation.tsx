"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Home, Plus, Calendar, MapPin, Bell, User, LogOut, Users, Menu, Search, ArrowLeft } from "lucide-react";
import Image from "next/image";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = SupabaseUser;

interface NavigationProps {
  showBackButton?: boolean;
  backHref?: string;
}

export default function Navigation({ showBackButton = false, backHref = "/" }: NavigationProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Local Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

  useEffect(() => {
    const initializeNavigation = async () => {
      try {
        const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      } catch (err) {
        console.error("Error initializing navigation:", err);
        setLoading(false);
      }
    };

    initializeNavigation();
  }, [supabaseUrl, supabaseAnonKey]);

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error("Error signing out:", err);
      window.location.href = '/';
    }
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

  // For logged-in users, show top navigation with main menu items below
  return (
    <>
      {/* Top Header Bar */}
      <div className="sticky top-0 z-50 bg-slate-700 border-b border-slate-600">
        <nav className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <Link href={backHref} className="text-white p-1 hover:bg-slate-600 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            ) : (
              <button className="text-white p-2 hover:bg-slate-600 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <span className="text-xl font-bold text-white">PokerPlace</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/search" className="text-white p-2 hover:bg-slate-600 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/profile" className="text-white p-2 hover:bg-slate-600 rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Navigation Menu */}
      <div className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto flex items-center justify-center py-4 px-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
              <Home className="w-6 h-6 fill-current" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            
            <Link href="/clubs" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
              <Users className="w-6 h-6" />
              <span className="text-sm font-medium">People</span>
            </Link>
            
            <Link href="/clubs/new" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">Add</span>
            </Link>
            
            <Link href="/events/nearby" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
              <MapPin className="w-6 h-6" />
              <span className="text-sm font-medium">Location</span>
            </Link>
            
            <Link href="/notifications" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="text-sm font-medium">Notifications</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
