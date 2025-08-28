"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, MapPin, Eye, EyeOff, Lock, Plus, Edit, Crown } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = SupabaseUser;

type Club = {
  id: string;
  name: string;
  slug: string;
  city: string;
  visibility: "public" | "private" | "hidden";
  description?: string;
  owner_id: string;
  created_at: string;
  member_count: number;
  event_count: number;
  user_role: "owner" | "member" | "none";
};

export default function ClubPage({ params }: { params: { slug: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchClub(params.slug, user.id);
      } else {
        // For public clubs, we can still show them without login
        fetchClub(params.slug);
      }
    };

    getUser();
  }, [supabase, params.slug]);

  const fetchClub = async (slug: string, userId?: string) => {
    try {
      // Fetch club details with member and event counts
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select(`
          *,
          club_members(count),
          events(count)
        `)
        .eq('slug', slug)
        .single();

      if (clubError) {
        console.error('Error fetching club:', clubError);
        setError('Club not found');
        setLoading(false);
        return;
      }

      if (!clubData) {
        setError('Club not found');
        setLoading(false);
        return;
      }

      // Determine user role
      let userRole: "owner" | "member" | "none" = "none";
      
      if (userId) {
        if (clubData.owner_id === userId) {
          userRole = "owner";
        } else {
          // Check if user is a member
          const { data: memberData } = await supabase
            .from('club_members')
            .select('*')
            .eq('club_id', clubData.id)
            .eq('user_id', userId)
            .single();
          
          if (memberData) {
            userRole = "member";
          }
        }
      }

      setClub({
        ...clubData,
        member_count: clubData.club_members?.[0]?.count || 0,
        event_count: clubData.events?.[0]?.count || 0,
        user_role: userRole
      });
    } catch (error) {
      console.error('Error fetching club:', error);
      setError('Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Eye className="w-4 h-4" />;
      case 'private':
        return <EyeOff className="w-4 h-4" />;
      case 'hidden':
        return <Lock className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      case 'hidden':
        return 'Hidden';
      default:
        return 'Public';
    }
  };

  const handleJoinClub = async () => {
    if (!club || !user) return;
    
    setJoining(true);
    try {
      const response = await fetch(`/api/clubs/${club.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join club');
      }

      // Update local state to reflect membership
      setClub(prev => prev ? { ...prev, user_role: 'member' as const } : null);
      alert('Successfully joined the club!');
    } catch (error) {
      console.error('Error joining club:', error);
      alert(error instanceof Error ? error.message : 'Failed to join club');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!club || !user) return;
    
    setLeaving(true);
    try {
      const response = await fetch(`/api/clubs/${club.id}/leave`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave club');
      }

      // Update local state to reflect leaving
      setClub(prev => prev ? { ...prev, user_role: 'none' as const } : null);
      alert('Successfully left the club');
    } catch (error) {
      console.error('Error leaving club:', error);
      alert(error instanceof Error ? error.message : 'Failed to leave club');
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-app flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
          <p className="text-emerald-mintSoft">Loading club...</p>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="bg-app flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-gradient">Club Not Found</h2>
          <p className="text-emerald-mintSoft mb-6">{error || 'The club you are looking for does not exist.'}</p>
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
              href="/dashboard"
              className="p-2 rounded-xl hover:bg-emerald-dark transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gradient">{club.name}</h1>
              <div className="flex items-center gap-4 text-emerald-mintSoft mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {club.city}
                </div>
                <div className="flex items-center gap-1">
                  {getVisibilityIcon(club.visibility)}
                  {getVisibilityText(club.visibility)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {club.user_role === "owner" && (
            <div className="flex items-center gap-2">
              <Link
                href={`/clubs/${club.slug}/edit`}
                className="btn-outline-modern rounded-xl px-4 py-2 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Club
              </Link>
              <Link
                href={`/clubs/${club.slug}/events/new`}
                className="btn-accent rounded-xl px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </Link>
            </div>
          )}
        </div>

                 {/* Club Icon and Info */}
         <div className="flex items-center gap-6 mb-8">
           {/* Club Icon */}
           <div className="w-24 h-24 rounded-xl border-2 border-emerald-mint/30 flex items-center justify-center bg-emerald-dark/50">
             {club.icon ? (
               <img 
                 src={club.icon} 
                 alt={`${club.name} icon`}
                 className="w-full h-full object-cover rounded-lg"
               />
             ) : (
               <span className="text-4xl font-bold text-emerald-mint">
                 {club.name.charAt(0).toUpperCase()}
               </span>
             )}
           </div>
           
           {/* Club Stats */}
           <div className="flex-1 grid gap-4 md:grid-cols-3">
          <div className="card-emerald p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-emerald-mint" />
              <h3 className="font-semibold text-glow">Members</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-mint">{club.member_count}</p>
            <p className="text-sm text-emerald-mintSoft">Active members</p>
          </div>

          <div className="card-teal p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-6 h-6 text-teal-accent" />
              <h3 className="font-semibold text-glow">Events</h3>
            </div>
            <p className="text-3xl font-bold text-teal-accent">{club.event_count}</p>
            <p className="text-sm text-teal-soft">Total events</p>
          </div>

          <div className="card-olive p-6">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-6 h-6 text-olive-accent" />
              <h3 className="font-semibold text-glow">Your Role</h3>
            </div>
            <p className="text-xl font-bold text-olive-accent capitalize">{club.user_role}</p>
            <p className="text-sm text-olive-limeSoft">
              {club.user_role === "owner" ? "Club owner" : 
               club.user_role === "member" ? "Club member" : "Not a member"}
            </p>
          </div>
        </div>
      </div>

        {/* Club Description */}
        {club.description && (
          <div className="card-emerald p-6 mb-8">
            <h3 className="font-semibold text-glow mb-3">About This Club</h3>
            <p className="text-emerald-mintSoft leading-relaxed">{club.description}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href={`/clubs/${club.slug}/events`}
            className="card-teal p-6 hover:bg-teal-dark/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Calendar className="w-8 h-8 text-teal-accent" />
              <div>
                <h3 className="font-semibold text-glow">View Events</h3>
                <p className="text-teal-soft">See upcoming and past events</p>
              </div>
            </div>
          </Link>

          <Link
            href={`/clubs/${club.slug}/members`}
            className="card-olive p-6 hover:bg-olive-dark/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-olive-accent" />
              <div>
                <h3 className="font-semibold text-glow">View Members</h3>
                <p className="text-olive-limeSoft">See who's in the club</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Join/Leave Club Button */}
        {user && club.user_role === "none" && club.visibility !== "hidden" && (
          <div className="mt-8 text-center">
            <button 
              onClick={handleJoinClub}
              disabled={joining}
              className="btn-accent rounded-xl px-8 py-3 disabled:opacity-60"
            >
              {joining ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner-modern h-4 w-4"></div>
                  Joining...
                </div>
              ) : (
                'Join Club'
              )}
            </button>
          </div>
        )}

        {user && club.user_role === "member" && (
          <div className="mt-8 text-center">
            <button 
              onClick={handleLeaveClub}
              disabled={leaving}
              className="btn-outline-modern rounded-xl px-8 py-3 disabled:opacity-60"
            >
              {leaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner-modern h-4 w-4"></div>
                  Leaving...
                </div>
              ) : (
                'Leave Club'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
