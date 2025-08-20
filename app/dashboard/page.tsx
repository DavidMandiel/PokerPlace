"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Plus, Users, Calendar, Settings, Crown } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = SupabaseUser;

type Club = {
  id: string;
  name: string;
  slug: string;
  city: string;
  visibility: "public" | "private" | "hidden";
  description?: string;
  member_count: number;
  event_count: number;
  role: "owner" | "member";
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ownedClubs, setOwnedClubs] = useState<Club[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClubs, setLoadingClubs] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchUserClubs(user.id);
      } else {
        // Redirect to auth if not logged in
        window.location.href = '/auth';
      }
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  const fetchUserClubs = async (userId: string) => {
    try {
      // Fetch owned clubs
      const { data: ownedData, error: ownedError } = await supabase
        .from('clubs')
        .select(`
          id,
          name,
          slug,
          city,
          visibility,
          description,
          club_members!inner(user_id),
          events(id)
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (ownedError) {
        console.error('Error fetching owned clubs:', ownedError);
      }

      // Fetch joined clubs (where user is a member but not owner)
      const { data: joinedData, error: joinedError } = await supabase
        .from('club_members')
        .select(`
          club_id,
          clubs!inner(
            id,
            name,
            slug,
            city,
            visibility,
            description,
            club_members(user_id),
            events(id)
          )
        `)
        .eq('user_id', userId)
        .neq('clubs.owner_id', userId)
        .order('joined_at', { ascending: false });

      if (joinedError) {
        console.error('Error fetching joined clubs:', joinedError);
      }

      // Transform owned clubs
      const transformedOwnedClubs = ownedData?.map(club => ({
        id: club.id,
        name: club.name,
        slug: club.slug,
        city: club.city,
        visibility: club.visibility,
        description: club.description,
        member_count: club.club_members?.length || 0,
        event_count: club.events?.length || 0,
        role: 'owner' as const,
      })) || [];

      // Transform joined clubs
      const transformedJoinedClubs = joinedData?.map(item => {
        const club = Array.isArray(item.clubs) ? item.clubs[0] : item.clubs;
        return {
          id: club.id,
          name: club.name,
          slug: club.slug,
          city: club.city,
          visibility: club.visibility,
          description: club.description,
          member_count: club.club_members?.length || 0,
          event_count: club.events?.length || 0,
          role: 'member' as const,
        };
      }) || [];

      setOwnedClubs(transformedOwnedClubs);
      setJoinedClubs(transformedJoinedClubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoadingClubs(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-app flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
          <p className="text-emerald-mintSoft">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.user_metadata?.nickname || 
                     user.user_metadata?.first_name || 
                     user.email?.split('@')[0] || 
                     'User';

  return (
    <div className="bg-app space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Welcome back, {displayName}!</h1>
          <p className="text-emerald-mintSoft mt-1">
            Manage your clubs or join new ones
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/events"
          className="group card-emerald p-6"
        >
          <div className="flex items-center gap-4">
            <div className="icon-modern">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-glow">Find Events</h3>
              <p className="text-emerald-mintSoft">
                Discover poker events near you
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/clubs"
          className="group card-teal p-6"
        >
          <div className="flex items-center gap-4">
            <div className="icon-glass">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-glow">Browse Clubs</h3>
              <p className="text-teal-soft">
                Find clubs to join
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/friends"
          className="group card-olive p-6"
        >
          <div className="flex items-center gap-4">
            <div className="icon-gradient">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-glow">See Your Friends</h3>
              <p className="text-olive-limeSoft">
                Connect with poker buddies
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* My Clubs Section */}
      <div className="animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gradient">My Clubs</h2>
          <Link
            href="/clubs/new"
            className="btn-accent rounded-xl px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            Create Club
          </Link>
        </div>

        {loadingClubs ? (
          <div className="text-center py-12">
            <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
            <p className="text-emerald-mintSoft">Loading your clubs...</p>
          </div>
        ) : ownedClubs.length === 0 && joinedClubs.length === 0 ? (
          <div className="text-center py-12 card-emerald">
            <Users className="w-12 h-12 text-emerald-mint mx-auto mb-4 animate-bounce-subtle" />
            <h3 className="text-lg font-semibold mb-2 text-gradient">No clubs yet</h3>
            <p className="text-emerald-mintSoft mb-4">
              Create a club to organize events or join existing clubs to play
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/clubs/new"
                className="btn-accent rounded-xl px-4 py-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Club
              </Link>
              <Link
                href="/clubs"
                className="btn-outline-modern rounded-xl px-4 py-2"
              >
                <Users className="w-4 h-4" />
                Browse Clubs
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Owned Clubs */}
            {ownedClubs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-brand-red" />
                  <span className="text-gradient">Clubs You Manage</span>
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {ownedClubs.map((club) => (
                    <div
                      key={club.id}
                      className="card-emerald p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-glow">{club.name}</h3>
                          <p className="text-emerald-mintSoft">
                            {club.city} • {club.visibility}
                          </p>
                        </div>
                        <Link
                          href={`/clubs/${club.slug}/settings`}
                          className="p-2 rounded-xl hover:bg-emerald-dark transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </Link>
                      </div>

                      {club.description && (
                        <p className="text-emerald-mintSoft mb-4 line-clamp-2">
                          {club.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-emerald-mintSoft mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {club.member_count} members
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {club.event_count} events
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/clubs/${club.slug}`}
                          className="flex-1 text-center btn-emerald rounded-xl"
                        >
                          View Club
                        </Link>
                        <Link
                          href={`/clubs/${club.slug}/events/new`}
                          className="flex-1 text-center btn-outline-modern rounded-xl"
                        >
                          Add Event
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Joined Clubs */}
            {joinedClubs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-accent" />
                  <span className="text-gradient">Clubs You've Joined</span>
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {joinedClubs.map((club) => (
                    <div
                      key={club.id}
                      className="card-teal p-6"
                    >
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg text-glow">{club.name}</h3>
                        <p className="text-teal-soft">
                          {club.city} • {club.visibility}
                        </p>
                      </div>

                      {club.description && (
                        <p className="text-teal-soft mb-4 line-clamp-2">
                          {club.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-teal-soft mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {club.member_count} members
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {club.event_count} events
                        </div>
                      </div>

                      <Link
                        href={`/clubs/${club.slug}`}
                        className="w-full text-center btn-teal rounded-xl"
                      >
                        View Club
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Events Section */}
      <div className="animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gradient">Upcoming Events</h2>
          <Link
            href="/events"
            className="text-emerald-mintSoft hover:text-emerald-mint hover:underline underline-offset-4 transition-colors"
          >
            View all events
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Placeholder Event Cards */}
          <div className="card-emerald p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm text-glow">Tel Aviv Poker Club</h3>
                <p className="text-xs text-emerald-mintSoft">Tournament</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">Dec 25</p>
                <p className="text-xs text-emerald-mintSoft">7:00 PM</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-mintSoft">
              <span>12 players registered</span>
              <span>8 seats available</span>
            </div>
          </div>

          <div className="card-teal p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm text-glow">Jerusalem Card Club</h3>
                <p className="text-xs text-teal-soft">Cash Game</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">Dec 26</p>
                <p className="text-xs text-teal-soft">8:00 PM</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-teal-soft">
              <span>8 players registered</span>
              <span>4 seats available</span>
            </div>
          </div>

          <div className="card-olive p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm text-glow">Haifa Poker Society</h3>
                <p className="text-xs text-olive-limeSoft">Sit & Go</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">Dec 27</p>
                <p className="text-xs text-olive-limeSoft">6:30 PM</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-olive-limeSoft">
              <span>6 players registered</span>
              <span>6 seats available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
