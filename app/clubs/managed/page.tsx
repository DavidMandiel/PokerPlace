"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Calendar, 
  Edit, 
  Plus,
  MapPin,
  ArrowLeft,
  Eye,
  MessageSquare
} from "lucide-react";
import Navigation from "../../components/Navigation";

interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
  country?: string;
  visibility: "public" | "private" | "hidden";
  description?: string;
  memberCount: number;
  upcomingEventsCount: number;
  icon?: string;
  owner_id: string;
}

export default function ManagedClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);
      loadUserClubs(user.id);
    };
    getUser();
  }, [supabase, router]);

  const loadUserClubs = async (userId: string) => {
    try {
      setLoading(true);
      
      // Fetch clubs owned by the current user
      const { data: ownedClubs, error: clubsError } = await supabase
        .from('clubs')
        .select(`
          id,
          name,
          slug,
          city,
          country,
          visibility,
          description,
          icon,
          owner_id
        `)
        .eq('owner_id', userId);

      if (clubsError) {
        console.error('Error fetching clubs:', clubsError);
        return;
      }

      // Fetch member counts for each club
      const clubsWithStats = await Promise.all(
        (ownedClubs || []).map(async (club) => {
          // Get member count
          const { count: memberCount } = await supabase
            .from('club_members')
            .select('*', { count: 'exact', head: true })
            .eq('club_id', club.id);

          // Get upcoming events count
          const { count: upcomingEventsCount } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('club_id', club.id)
            .gte('starts_at', new Date().toISOString());

          return {
            ...club,
            memberCount: memberCount || 0,
            upcomingEventsCount: upcomingEventsCount || 0
          };
        })
      );

      setClubs(clubsWithStats);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle View Club - redirect to club's main page
  const handleViewClub = (clubSlug: string) => {
    router.push(`/clubs/${clubSlug}`);
  };

  const getPrivacyColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-pink-500 text-white';
      case 'private':
        return 'bg-green-400 text-white';
      case 'hidden':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPrivacyLabel = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      case 'hidden':
        return 'Secret';
      default:
        return 'Unknown';
    }
  };

  // Handle Message Members - redirect to chat dialogue
  const handleMessageMembers = (clubId: string, clubName: string) => {
    // TODO: Implement chat functionality
    // For now, redirect to a chat page or show a modal
    alert(`Message Members functionality for ${clubName} - This will redirect to a dialogue chat to send a message to all members.`);
  };

  // Handle Members card click - redirect to members page
  const handleMembersClick = (clubSlug: string) => {
    router.push(`/clubs/${clubSlug}/members`);
  };

  // Handle Upcoming Events card click - redirect to managed events page
  const handleEventsClick = (clubSlug: string) => {
    router.push(`/clubs/${clubSlug}/events`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Managed Clubs</h1>
              </div>
            </div>
            <Link href="/clubs/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Club
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Stats Summary - More Compact */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
              <div className="text-lg font-bold text-emerald-600">{clubs.length}</div>
              <div className="text-xs text-gray-600">Total Clubs</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
              <div className="text-lg font-bold text-blue-600">
                {clubs.reduce((sum, club) => sum + club.memberCount, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Members</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
              <div className="text-lg font-bold text-blue-600">
                {clubs.reduce((sum, club) => sum + club.upcomingEventsCount, 0)}
              </div>
              <div className="text-xs text-gray-600">Upcoming Events</div>
            </div>
          </div>

          {/* Clubs List */}
          <div className="space-y-4">
            {clubs.map((club) => (
              <div key={club.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden h-52 relative">
                {/* Clickable area for club main page - excludes action buttons */}
                <Link 
                  href={`/clubs/${club.slug}`}
                  className="absolute inset-0 z-10"
                  style={{ 
                    clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0 75%)' // Covers top 75% of card, excluding action buttons
                  }}
                />
                
                <div className="p-3 pb-4 h-full flex flex-col relative z-20">
                  {/* Club Header - Compact layout */}
                  <div className="flex items-start gap-3 mb-2">
                    {/* Club Logo - Circular */}
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {club.icon ? (
                        <img 
                          src={club.icon} 
                          alt={club.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {club.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Club Info - Compact layout */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <h3 className="text-base font-bold text-gray-900 leading-tight">{club.name}</h3>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {club.city}{club.country ? `, ${club.country}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Message Members Button - Small with caption below */}
                    <div className="flex-shrink-0 text-center">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMessageMembers(club.id, club.name);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded-lg transition-colors flex flex-col items-center gap-1 relative z-30"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-xs">Message</span>
                      </button>
                    </div>
                  </div>

                  {/* Privacy Level - Below logo */}
                  <div className="mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPrivacyColor(club.visibility)}`}>
                      {getPrivacyLabel(club.visibility)}
                    </span>
                  </div>

                  {/* Club Statistics Cards - Very compact layout */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Members Card */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMembersClick(club.slug);
                      }}
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-1 text-center transition-colors cursor-pointer relative z-30"
                    >
                      <div className="flex items-center justify-center mb-0.5">
                        <Users className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="text-xs text-gray-600 mb-0.5">Members</div>
                      <div className="text-xs font-bold text-gray-900">{club.memberCount}</div>
                    </button>

                    {/* Upcoming Events Card */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEventsClick(club.slug);
                      }}
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-1 text-center transition-colors cursor-pointer relative z-30"
                    >
                      <div className="flex items-center justify-center mb-0.5">
                        <Calendar className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="text-xs text-gray-600 mb-0.5">Upcoming Events</div>
                      <div className="text-xs font-bold text-gray-900">{club.upcomingEventsCount}</div>
                    </button>
                  </div>

                  {/* Action Buttons - Small with captions at bottom, spanning full width */}
                  <div className="flex items-center justify-between gap-1 mt-auto pb-0 relative z-30">
                    {/* View Club Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewClub(club.slug);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 pt-1 pb-0 rounded text-xs font-medium transition-colors flex flex-col items-center gap-1 flex-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="text-xs">View Club</span>
                    </button>

                    {/* Edit Club Button */}
                    <Link 
                      href={`/clubs/${club.slug}/edit`} 
                      onClick={(e) => e.stopPropagation()}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-2 pt-1 pb-0 rounded text-xs font-medium transition-colors flex flex-col items-center gap-1 flex-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span className="text-xs">Edit</span>
                    </Link>

                    {/* Add Event Button */}
                    <Link 
                      href={`/clubs/${club.slug}/events/new`} 
                      onClick={(e) => e.stopPropagation()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 pt-1 pb-0 rounded text-xs font-medium transition-colors flex flex-col items-center gap-1 flex-1"
                    >
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">Add Event</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {clubs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No managed clubs yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first poker club</p>
              <Link href="/clubs/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Club
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

