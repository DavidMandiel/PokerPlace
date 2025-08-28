"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { User, Mail, Lock, MapPin, Crown } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            nickname: nickname,
            country: country,
            city: city,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        // Success - redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-app flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Join PokerPlace</h1>
          <p className="text-emerald-mintSoft">
            Create your account to organize and join poker events
          </p>
        </div>

        <div className="card-emerald p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-brand-red/10 border border-brand-red/20 p-4 text-sm text-brand-red">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-emerald-mint mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-emerald-mint/30 bg-brand-bg1 px-4 py-3 text-sm text-white placeholder-emerald-mintSoft focus:outline-none focus:ring-2 focus:ring-emerald-mint/20 focus:border-emerald-mint transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-emerald-mint mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-emerald-mint/30 bg-brand-bg1 px-4 py-3 text-sm text-white placeholder-emerald-mintSoft focus:outline-none focus:ring-2 focus:ring-emerald-mint/20 focus:border-emerald-mint transition-all duration-200"
                placeholder="At least 6 characters"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-emerald-mint mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-emerald-mint/30 bg-brand-bg1 px-4 py-3 text-sm text-white placeholder-emerald-mintSoft focus:outline-none focus:ring-2 focus:ring-emerald-mint/20 focus:border-emerald-mint transition-all duration-200"
                placeholder="Re-enter your password"
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-emerald-mint mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-emerald-mint/30 bg-brand-bg1 px-4 py-3 text-sm text-white placeholder-emerald-mintSoft focus:outline-none focus:ring-2 focus:ring-emerald-mint/20 focus:border-emerald-mint transition-all duration-200"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-emerald-mint mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-emerald-mint/30 bg-brand-bg1 px-4 py-3 text-sm text-white placeholder-emerald-mintSoft focus:outline-none focus:ring-2 focus:ring-emerald-mint/20 focus:border-emerald-mint transition-all duration-200"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Nickname */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-emerald-mint mb-2">
                <Crown className="w-4 h-4 inline mr-2" />
                Nickname (optional)
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-xl border border-emerald-mint/30 bg-brand-bg1 px-4 py-3 text-sm text-white placeholder-emerald-mintSoft focus:outline-none focus:ring-2 focus:ring-emerald-mint/20 focus:border-emerald-mint transition-all duration-200"
                placeholder="PokerKing"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-emerald-mint mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full rounded-xl border border-emerald-mint/30 bg-brand-bg1 px-4 py-3 text-sm text-white placeholder-emerald-mintSoft focus:outline-none focus:ring-2 focus:ring-emerald-mint/20 focus:border-emerald-mint transition-all duration-200"
                  placeholder="Israel"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-emerald-mint mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full rounded-xl border border-emerald-mint/30 bg-brand-bg1 px-4 py-3 text-sm text-white placeholder-emerald-mintSoft focus:outline-none focus:ring-2 focus:ring-emerald-mint/20 focus:border-emerald-mint transition-all duration-200"
                  placeholder="Tel Aviv"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent rounded-xl px-6 py-3 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner-modern h-4 w-4"></div>
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-emerald-mintSoft">
            Already have an account?{" "}
            <Link href="/auth" className="text-emerald-mint hover:underline font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
