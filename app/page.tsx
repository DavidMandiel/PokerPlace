"use client";
import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LandingPage() {
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
      } else {
        // If no user, go to onboarding
        router.push('/onboarding');
      }
    };

    checkUser();
  }, [supabase, router]);

  // Show loading while checking user status
  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="text-center">
        <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
        <p className="text-emerald-mintSoft">Loading...</p>
      </div>
    </div>
  );
}
