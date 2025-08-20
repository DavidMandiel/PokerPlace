"use client";
import { createBrowserClient } from "@supabase/ssr";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useMemo } from "react";

export default function AuthPage() {
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Use email or Google to continue.</p>
      <div className="mt-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-6 bg-white/60 dark:bg-zinc-950/50">
        <Auth supabaseClient={supabase} view="sign_in" appearance={{ theme: ThemeSupa }} providers={["google"]} />
      </div>
    </div>
  );
}


