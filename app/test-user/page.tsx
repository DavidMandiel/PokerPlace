"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { User, Mail, Key, MapPin, Crown, Plus, AlertTriangle } from "lucide-react";

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
      // Create a test user with a valid disposable email domain
      const randomId = Math.random().toString(36).substring(2, 6);
      const testEmail = `test${randomId}@mailinator.com`;
      
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
    <div className="bg-app flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Create Test User</h1>
          <p className="text-emerald-mintSoft">
            This page helps you create a test user for dashboard testing.
          </p>
        </div>

        <div className="card-emerald p-8">
          <button
            onClick={createTestUser}
            disabled={loading}
            className="w-full btn-accent rounded-xl px-6 py-3 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="spinner-modern h-4 w-4"></div>
                Creating test user...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Create Test User
              </div>
            )}
          </button>

          {message && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-mint/10 border border-emerald-mint/20 text-sm whitespace-pre-line text-emerald-mintSoft">
              {message}
            </div>
          )}
        </div>

        <div className="mt-6 text-center space-y-3">
          <Link
            href="/auth"
            className="block text-emerald-mintSoft hover:text-emerald-mint hover:underline transition-colors"
          >
            Go to Sign In
          </Link>
          <Link
            href="/dashboard"
            className="block text-emerald-mintSoft hover:text-emerald-mint hover:underline transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 card-teal p-6">
          <h3 className="font-semibold text-glow mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Test User Details
          </h3>
          <div className="space-y-3 text-sm text-teal-soft">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Email: Will be generated as test[random]@mailinator.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>Password: password123</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Name: John Doe</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              <span>Nickname: PokerKing</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Location: Tel Aviv, Israel</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-brand-red/10 border border-brand-red/20">
            <div className="flex items-start gap-2 text-xs text-brand-red">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Note: This creates a real user account. Use your real email address for testing - 
                emails will be sent via SendGrid SMTP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
