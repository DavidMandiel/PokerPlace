"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { 
  Search, 
  Calendar, 
  CheckCircle, 
  Users, 
  MapPin, 
  Bell, 
  Home, 
  Plus, 
  User, 
  ExternalLink,
  Star,
  Clock,
  DollarSign,
  Eye,
  Lock,
  Menu
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import EventCard, { Event } from "../components/EventCard";
import Navigation from "../components/Navigation";

type User = SupabaseUser;

interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
  visibility: "public" | "private" | "hidden";
  description?: string;
  memberCount: number;
  isOwner: boolean;
  image?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingEvent, setUpcomingEvent] = useState<Event | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [suggestedClubs, setSuggestedClubs] = useState<Club[]>([]);

  // Local Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Supabase connection error:", error);
          setError("Connection error");
        } else if (user) {
          setUser(user);
          await loadRealData();
        } else {
          setError("User not authenticated");
        }
      } catch (err) {
        console.error("Error initializing Supabase:", err);
        setError("Failed to initialize");
      }
      
      setLoading(false);
    };

    initializeApp();
  }, [supabaseUrl, supabaseAnonKey]);

  const loadRealData = async () => {
    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        setError("User not authenticated");
        return;
      }

      // Fetch upcoming events (events starting from today onwards)
      const { data: upcomingEventsData, error: upcomingEventsError } = await supabase
        .from('events')
        .select(`
          id,
          name,
          event_type,
          game_type,
          buyin,
          max_players,
          starts_at,
          created_by,
          clubs!inner(name, city, country)
        `)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(10);

      if (upcomingEventsError) {
        console.error('Error fetching upcoming events:', upcomingEventsError);
      } else if (upcomingEventsData && upcomingEventsData.length > 0) {
        // Get unique creator IDs
        const creatorIds = [...new Set(upcomingEventsData.map(event => event.created_by))];
        
        // Fetch user profiles for creators
        const { data: creatorProfiles } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, nickname')
          .in('id', creatorIds);

        // Create a map for quick lookup
        const profilesMap = new Map(creatorProfiles?.map(profile => [profile.id, profile]) || []);

        const formattedUpcomingEvents: Event[] = upcomingEventsData.map(event => {
          const creatorProfile = profilesMap.get(event.created_by);
          return {
            id: event.id,
            title: event.name,
            type: event.event_type as "tournament" | "cash",
            gameType: event.game_type || "TNLH",
            buyin: event.buyin || 100,
            date: new Date(event.starts_at).toLocaleDateString('en-GB'),
            time: new Date(event.starts_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            location: `${event.clubs.city}, ${event.clubs.country}`,
            availableSeats: Math.max(0, (event.max_players || 27) - 0), // TODO: Calculate actual available seats
            totalSeats: event.max_players || 27,
            privacy: "public" as const,
            host: {
              name: creatorProfile ? 
                `${creatorProfile.first_name || ''} ${creatorProfile.last_name || ''}`.trim() || 
                creatorProfile.nickname || "Unknown Host" : "Unknown Host",
              rating: 4, // Default rating
              eventsCreated: 0 // TODO: Get actual count
            },
            userStatus: "upcoming" as const,
            isClubMember: false, // TODO: Check if user is club member
            image: "/background.png"
          };
        });

        // Set first event as main upcoming event
        if (formattedUpcomingEvents.length > 0) {
          setUpcomingEvent(formattedUpcomingEvents[0]);
          setUpcomingEvents(formattedUpcomingEvents.slice(1, 4)); // Next 3 events
        }

        // Set remaining as other events
        setOtherEvents(formattedUpcomingEvents.slice(4));
      }

      // Fetch suggested clubs (public clubs, limit to 3)
      const { data: suggestedClubsData, error: suggestedClubsError } = await supabase
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
        .eq('visibility', 'public')
        .limit(3);

      if (suggestedClubsError) {
        console.error('Error fetching suggested clubs:', suggestedClubsError);
      } else if (suggestedClubsData) {
        // Get member counts for each club
        const clubsWithMembers = await Promise.all(
          suggestedClubsData.map(async (club) => {
            const { count: memberCount } = await supabase
              .from('club_members')
              .select('*', { count: 'exact', head: true })
              .eq('club_id', club.id);

            return {
              id: club.id,
              name: club.name,
              slug: club.slug,
              city: club.city,
              visibility: club.visibility,
              description: club.description,
              memberCount: memberCount || 0,
              isOwner: club.owner_id === currentUser.id,
              image: club.icon || "/background.png"
            };
          })
        );

        setSuggestedClubs(clubsWithMembers);
      }

      // TODO: Fetch registered events for current user
      // This would require an event_registrations table
      setRegisteredEvents([]);

    } catch (error) {
      console.error('Error loading real data:', error);
      setError("Failed to load data");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="spinner-clean h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </>
    );
  }

  const displayName = user?.user_metadata?.nickname || 
                     user?.user_metadata?.first_name || 
                     user?.email?.split('@')[0] || 
                     'Demo User';

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        {/* User Avatar Section */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-gray-700">
              <p className="font-medium">Welcome back, {displayName}!</p>
            </div>
          </div>
        </div>

      <div className="container-mobile">
        {/* Your Next Event Section - Half height card */}
        {upcomingEvent ? (
          <div className="mt-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Event Image/Logo Header - Half height */}
              <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                {upcomingEvent.image ? (
                  <img 
                    src={upcomingEvent.image} 
                    alt={upcomingEvent.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src="/icon-app.png" 
                    alt="PokerPlace"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="text-white text-base font-bold mb-1">{upcomingEvent.title}</h3>
                  <p className="text-white/90 text-xs font-medium">{upcomingEvent.gameType}</p>
                </div>
              </div>

              {/* Event Details - Compact layout */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="font-medium">BUYIN: ${upcomingEvent.buyin}</span>
                  <span className="font-medium">SEATS: {upcomingEvent.availableSeats}/{upcomingEvent.totalSeats}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="font-medium">DATE: {upcomingEvent.date}</span>
                  <span className="font-medium">{upcomingEvent.location}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(upcomingEvent.availableSeats / upcomingEvent.totalSeats) * 100}%` }}
                  />
                </div>

                {/* Action Button */}
                <button className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1.5 px-3 rounded-lg transition-colors font-medium">
                  unregister
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
              <p className="text-gray-600 mb-4">There are no upcoming events at the moment.</p>
              <Link href="/events/new" className="text-blue-600 hover:underline">
                Create your first event
              </Link>
            </div>
          </div>
        )}

        {/* Managed Clubs Button */}
        <div className="mb-8">
          <div className="flex justify-center">
            <Link href="/clubs/managed" className="w-full max-w-xs">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-3 px-4 rounded-lg transition-colors font-medium">
                Manage My Clubs
              </button>
            </Link>
          </div>
        </div>

        {/* Upcoming Events Section - Container width background header */}
        <div className="mb-8">
          <div className="bg-blue-600 text-white rounded-lg py-3 px-4 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming Events</h2>
              <Link href="/events/upcoming" className="text-blue-200 text-sm hover:underline">
                more
              </Link>
            </div>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex-shrink-0 w-48">
                  <EventCard event={event} variant="upcoming" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No additional upcoming events</p>
            </div>
          )}
        </div>

        {/* Other Events Section - Container width background header */}
        <div className="mb-8">
          <div className="bg-green-600 text-white rounded-lg py-3 px-4 mb-4">
            <h2 className="text-lg font-semibold">Other Events</h2>
          </div>
          {otherEvents.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {otherEvents.map((event) => (
                <div key={event.id} className="flex-shrink-0 w-48">
                  <EventCard event={event} variant="other" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No other events available</p>
            </div>
          )}
        </div>

        {/* Registered Events Section - Container width background header */}
        <div className="mb-8">
          <div className="bg-pink-600 text-white rounded-lg py-3 px-4 mb-4">
            <h2 className="text-lg font-semibold">Registered Events</h2>
          </div>
          {registeredEvents.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {registeredEvents.map((event) => (
                <div key={event.id} className="flex-shrink-0 w-48">
                  <EventCard event={event} variant="registered" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No registered events</p>
            </div>
          )}
        </div>

        {/* Suggested Clubs Section - Container width background header */}
        <div className="mb-8">
          <div className="bg-purple-600 text-white rounded-lg py-3 px-4 mb-4">
            <h2 className="text-lg font-semibold">Suggested Clubs</h2>
          </div>
          {suggestedClubs.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {suggestedClubs.map((club) => (
                <div key={club.id} className="flex-shrink-0 w-48">
                  <ClubCard club={club} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No clubs available</p>
              <Link href="/clubs/new" className="text-blue-600 hover:underline mt-2 inline-block">
                Create your first club
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

// Club Card Component - Smaller size, removed badge icon, consistent height
function ClubCard({ club }: { club: Club }) {
  return (
    <Link href={`/clubs/${club.slug}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-48">
        {/* Club Image - Fixed height */}
        <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 relative">
          {club.image ? (
            <img 
              src={club.image} 
              alt={club.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="/icon-app.png" 
              alt="PokerPlace"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white text-sm font-bold mb-1 truncate">{club.name}</h3>
          </div>
        </div>

        {/* Club Details - Fixed height content */}
        <div className="p-3 h-20 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{club.name}</h3>
            <p className="text-gray-600 text-xs mb-1 truncate">{club.city}</p>
            
            {club.description && (
              <p className="text-gray-600 text-xs mb-1 line-clamp-2">{club.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{club.memberCount} members</span>
              <span className="capitalize">{club.visibility}</span>
            </div>
          </div>
        </div>

        {/* Action button - Fixed height */}
        <div className="px-3 pb-3 h-8 flex items-center">
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-1.5 px-3 rounded-lg transition-colors">
            Request To Join Club
          </button>
        </div>
      </div>
    </Link>
  );
}
