"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function TestUserPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const createTestUser = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Create a test user with a real email domain
      const randomId = Math.random().toString(36).substring(2, 6);
      const testEmail = `test${randomId}@gmail.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: "password123",
        options: {
          data: {
            first_name: "John",
            last_name: "Doe",
            nickname: "PokerKing",
            country: "Israel",
            city: "Tel Aviv",
          }
        }
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        console.error('Sign up error:', error);
      } else {
        setMessage(`Test user created successfully!
Email: ${testEmail}
Password: password123

You can now sign in with these credentials at /auth`);
      }
    } catch (err) {
      setMessage(`Error: ${err}`);
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Test User</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This page helps you create a test user for dashboard testing.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-6 bg-white/60 dark:bg-zinc-950/50">
        <button
          onClick={createTestUser}
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-lg bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? "Creating test user..." : "Create Test User"}
        </button>

        {message && (
          <div className="mt-4 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm whitespace-pre-line">
            {message}
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <Link
          href="/auth"
          className="block text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          Go to Sign In
        </Link>
        <Link
          href="/dashboard"
          className="block text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          Go to Dashboard
        </Link>
      </div>

      <div className="text-xs text-zinc-500 dark:text-zinc-500 space-y-2">
        <p><strong>Test User Details:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Email: Will be generated as test[random]@gmail.com</li>
          <li>Password: password123</li>
          <li>Name: John Doe</li>
          <li>Nickname: PokerKing</li>
          <li>Location: Tel Aviv, Israel</li>
        </ul>
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          Note: This creates a real user account. You can use any email format you prefer.
        </p>
      </div>
    </div>
  );
}
