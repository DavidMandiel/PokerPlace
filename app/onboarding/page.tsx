"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, SkipForward } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = SupabaseUser;

export default function OnboardingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // If user is already logged in, redirect to dashboard
        window.location.href = '/dashboard';
      }
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
          <p className="text-emerald-mintSoft">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-md mx-auto">
          {/* Logo and Welcome */}
          <div className="mb-12">
            <Image 
              src="/icon-app.png" 
              alt="PokerPlace" 
              width={80} 
              height={80} 
              className="mx-auto mb-6"
            />
            <h1 className="text-3xl font-bold text-gradient mb-4">
              Welcome to PokerPlace
            </h1>
            <p className="text-emerald-mintSoft text-lg leading-relaxed">
              Your Home Game Event Manager and Social Poker Network
            </p>
          </div>

          {/* Onboarding Options */}
          <div className="space-y-4 mb-8">
            <Link 
              href="/auth/signup"
              className="flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
            >
              <span>Create New Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              href="/auth"
              className="flex items-center justify-between w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-emerald-mintSoft hover:text-emerald-mint transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip for now</span>
            </Link>
            <p className="text-emerald-mintSoft text-xs mt-2">
              Explore with limited features
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-emerald-mint/20 py-6 px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-emerald-mintSoft text-xs mb-2">
            No gambling or real-money transactions. This app is for organizational and social purposes only.
          </p>
          <p className="text-emerald-mintSoft text-xs">
            © 2025 PokerPlace
          </p>
        </div>
      </footer>
    </div>
  );
}
