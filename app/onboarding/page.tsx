"use client";
import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // If user is logged in, go to dashboard
        router.push('/dashboard');
      }
    };

    checkUser();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-gray-900">PokerPlace</span>
        </div>
        <Link href="/auth" className="text-blue-600 text-sm font-medium">
          Sign in
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md mx-auto">
          {/* Hero Image */}
          <div className="mb-8">
            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <div className="text-white text-6xl">🃏</div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome To PokerPlace
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Your Home Game Event Manager and A Social Poker Network
          </p>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <Facebook className="w-5 h-5 text-gray-600" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <Instagram className="w-5 h-5 text-gray-600" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <Twitter className="w-5 h-5 text-gray-600" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <Youtube className="w-5 h-5 text-gray-600" />
            </a>
          </div>

          {/* Register Button */}
          <Link href="/auth" className="block w-full btn-primary text-center mb-4">
            Register
          </Link>

          {/* Login Link */}
          <p className="text-gray-600">
            Already registered?{" "}
            <Link href="/auth" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Navigation Preview */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <div className="flex flex-col items-center gap-1 text-blue-600">
            <div className="w-5 h-5 bg-blue-600 rounded"></div>
            <span className="text-xs">Home</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <span className="text-xs">Create</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <span className="text-xs">Events</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <span className="text-xs">Clubs</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <span className="text-xs">Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}