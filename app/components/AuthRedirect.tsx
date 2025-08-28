"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = SupabaseUser;

export default function AuthRedirect() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is signed in, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User is not signed in, stay on landing page
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // User signed in, redirect to dashboard
          router.push('/dashboard');
        } else {
          // User signed out, stay on landing page
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-mint"></div>
      </div>
    );
  }

  // Return null when not loading and user is not authenticated (show landing page)
  return null;
}
