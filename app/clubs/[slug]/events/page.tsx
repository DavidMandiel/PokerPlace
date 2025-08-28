"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = SupabaseUser;

type Club = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
};

export default function ClubEventsPage({ params }: { params: { slug: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchClub(params.slug);
      } else {
        fetchClub(params.slug);
      }
    };

    getUser();
  }, [supabase, params.slug]);

  const fetchClub = async (slug: string) => {
    try {
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (clubError) {
        console.error('Error fetching club:', clubError);
        setLoading(false);
        return;
      }

      setClub(clubData);
    } catch (error) {
      console.error('Error fetching club:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-app flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
          <p className="text-emerald-mintSoft">Loading events...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="bg-app flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-gradient">Club Not Found</h2>
          <p className="text-emerald-mintSoft mb-6">The club you are looking for does not exist.</p>
          <Link
            href="/clubs"
            className="btn-accent rounded-xl px-6 py-2"
          >
            Browse Clubs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/clubs/${club.slug}`}
              className="p-2 rounded-xl hover:bg-emerald-dark transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Club Events</h1>
              <p className="text-emerald-mintSoft">{club.name}</p>
            </div>
          </div>

          {user && club.owner_id === user.id && (
            <Link
              href={`/clubs/${club.slug}/events/new`}
              className="btn-accent rounded-xl px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </Link>
          )}
        </div>

        {/* Coming Soon */}
        <div className="card-emerald p-12 text-center">
          <Calendar className="w-16 h-16 text-emerald-mint mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4 text-gradient">Events Coming Soon</h2>
          <p className="text-emerald-mintSoft mb-6 max-w-md mx-auto">
            We're working on bringing you a comprehensive events system. Soon you'll be able to view, create, and manage all club events in one place.
          </p>
          <Link
            href={`/clubs/${club.slug}`}
            className="btn-outline-modern rounded-xl px-6 py-2"
          >
            Back to Club
          </Link>
        </div>
      </div>
    </div>
  );
}
