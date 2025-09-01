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
  Lock
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import EventCard, { Event } from "../components/EventCard";

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
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingEvent, setUpcomingEvent] = useState<Event | null>(null);
  const [friendsEvents, setFriendsEvents] = useState<Event[]>([]);
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [registeredClubs, setRegisteredClubs] = useState<Club[]>([]);
  const [managedClubs, setManagedClubs] = useState<Club[]>([]);

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
          // Still load mock data if connection fails
          loadMockData();
        } else if (user) {
          setUser(user);
          loadMockData();
        } else {
          // No user logged in, but connection is working
          loadMockData();
        }
      } catch (err) {
        console.error("Error initializing Supabase:", err);
        loadMockData();
      }
      
      setLoading(false);
    };

    initializeApp();
  }, [supabaseUrl, supabaseAnonKey]);

  const loadMockData = () => {
    // Mock upcoming event
    const mockUpcomingEvent: Event = {
      id: "1",
      title: "SUNDAY TOURNAMENT",
      type: "tournament",
      gameType: "TNLH",
      buyin: 100,
      date: "24/2/2021",
      time: "20:00",
      location: "456 Casino Blvd, Las Vegas, NV 89101",
      availableSeats: 5,
      totalSeats: 27,
      privacy: "private",
      host: {
        name: "John Dow",
        rating: 4,
        eventsCreated: 212
      },
      userStatus: "upcoming",
      isClubMember: true
    };

    // Mock friends events
    const mockFriendsEvents: Event[] = [
      {
        id: "2",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 100,
        date: "27/2/2021",
        time: "20:00",
        location: "6391 Elgin St. Celina, Delaware 10299",
        availableSeats: 6,
        totalSeats: 27,
        privacy: "private",
        host: {
          name: "John Dow",
          rating: 4,
          eventsCreated: 212
        },
        userStatus: "friends",
        isClubMember: true
      },
      {
        id: "3",
        title: "Monday Night NL",
        type: "tournament",
        gameType: "TNLH",
        buyin: 150,
        date: "28/2/2021",
        time: "19:00",
        location: "Downtown Poker Club",
        availableSeats: 3,
        totalSeats: 20,
        privacy: "private",
        host: {
          name: "Sarah Wilson",
          rating: 5,
          eventsCreated: 89
        },
        userStatus: "friends",
        isClubMember: true
      }
    ];

    // Mock other events
    const mockOtherEvents: Event[] = [
      {
        id: "4",
        title: "Sunday Main Tournament",
        type: "tournament",
        gameType: "TNLH",
        buyin: 100,
        date: "27/2/2021",
        time: "20:00",
        location: "6391 Elgin St. Celina, Delaware 10299",
        availableSeats: 6,
        totalSeats: 27,
        privacy: "public",
        host: {
          name: "John Dow",
          rating: 4,
          eventsCreated: 212
        },
        userStatus: "other",
        isClubMember: false
      },
      {
        id: "5",
        title: "High Stakes Cash",
        type: "cash",
        gameType: "PLO",
        buyin: 500,
        date: "26/2/2021",
        time: "21:00",
        location: "Luxury Casino",
        availableSeats: 2,
        totalSeats: 8,
        privacy: "public",
        host: {
          name: "Mike Johnson",
          rating: 4,
          eventsCreated: 156
        },
        userStatus: "other",
        isClubMember: false
      }
    ];

    // Mock registered events
    const mockRegisteredEvents: Event[] = [
      {
        id: "6",
        title: "Monday Omaha Cash",
        type: "cash",
        gameType: "PLO",
        buyin: 200,
        date: "25/2/2021",
        time: "21:00",
        location: "Tel Aviv, Israel",
        availableSeats: 2,
        totalSeats: 8,
        privacy: "private",
        host: {
          name: "Event Host",
          rating: 3,
          eventsCreated: 212
        },
        userStatus: "registered",
        isClubMember: false
      },
      {
        id: "7",
        title: "Wednesday Tournament",
        type: "tournament",
        gameType: "TNLH",
        buyin: 75,
        date: "23/2/2021",
        time: "18:00",
        location: "Local Poker Room",
        availableSeats: 1,
        totalSeats: 15,
        privacy: "public",
        host: {
          name: "Local Host",
          rating: 4,
          eventsCreated: 67
        },
        userStatus: "registered",
        isClubMember: true
      }
    ];

    // Mock clubs
    const mockRegisteredClubs: Club[] = [
      {
        id: "1",
        name: "Vegas Elite",
        slug: "vegas-elite",
        city: "Las Vegas",
        visibility: "private",
        description: "High stakes poker club",
        memberCount: 45,
        isOwner: false
      },
      {
        id: "2",
        name: "Downtown Players",
        slug: "downtown-players",
        city: "New York",
        visibility: "public",
        description: "Friendly neighborhood poker",
        memberCount: 23,
        isOwner: false
      }
    ];

    const mockManagedClubs: Club[] = [
      {
        id: "3",
        name: "My Poker Club",
        slug: "my-poker-club",
        city: "Los Angeles",
        visibility: "private",
        description: "My personal poker club",
        memberCount: 12,
        isOwner: true
      }
    ];

    setUpcomingEvent(mockUpcomingEvent);
    setFriendsEvents(mockFriendsEvents);
    setOtherEvents(mockOtherEvents);
    setRegisteredEvents(mockRegisteredEvents);
    setRegisteredClubs(mockRegisteredClubs);
    setManagedClubs(mockManagedClubs);
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

  const displayName = user?.user_metadata?.nickname || 
                     user?.user_metadata?.first_name || 
                     user?.email?.split('@')[0] || 
                     'Demo User';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-mobile">
        {/* Enhanced Header */}
        <div className="sticky-header mb-6 p-4 -mx-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hi {displayName}</h1>
                <p className="text-gray-600 text-sm">Your upcoming events: {registeredEvents.length + 1}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Featured Upcoming Event Banner */}
          {upcomingEvent && (
            <div className="card-clean p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-xl mb-1">{upcomingEvent.title}</h2>
                    <p className="text-red-500 text-sm font-medium">START IN: 2 DAYS</p>
                    <p className="text-gray-600 text-sm">{upcomingEvent.gameType} • ${upcomingEvent.buyin}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <button className="text-red-500 text-xs hover:underline">Unregister</button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-gray-600 text-xs">Available Seats</p>
                  <p className="font-bold text-lg">{upcomingEvent.availableSeats}/{upcomingEvent.totalSeats}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-gray-600 text-xs">Date</p>
                  <p className="font-bold text-lg">{upcomingEvent.date}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 btn-secondary text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </button>
                <button className="flex-1 btn-primary text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Access Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/clubs/my" className="card-clean p-4 text-center hover:shadow-md transition-shadow">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">My Clubs</h3>
              <p className="text-gray-600 text-sm">{registeredClubs.length} clubs</p>
            </Link>
            
            <Link href="/events/managed" className="card-clean p-4 text-center hover:shadow-md transition-shadow">
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Managed Events</h3>
              <p className="text-gray-600 text-sm">{managedClubs.length} events</p>
            </Link>
            
            <Link href="/events/nearby" className="card-clean p-4 text-center hover:shadow-md transition-shadow">
              <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Nearby Events</h3>
              <p className="text-gray-600 text-sm">{otherEvents.length} available</p>
            </Link>
            
            <Link href="/events/friends" className="card-clean p-4 text-center hover:shadow-md transition-shadow">
              <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Friends Events</h3>
              <p className="text-gray-600 text-sm">{friendsEvents.length} events</p>
            </Link>
          </div>
        </div>

        {/* Registered Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Registered Events</h2>
            <Link href="/events/registered" className="text-blue-600 text-sm hover:underline">
              View all ({registeredEvents.length})
            </Link>
          </div>
          <div className="space-y-4">
            {registeredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Friends Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Friends Events</h2>
            <Link href="/events/friends" className="text-blue-600 text-sm hover:underline">
              View all ({friendsEvents.length})
            </Link>
          </div>
          <div className="space-y-4">
            {friendsEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Nearby Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Nearby Events</h2>
            <Link href="/events/nearby" className="text-blue-600 text-sm hover:underline">
              View all ({otherEvents.length})
            </Link>
          </div>
          <div className="space-y-4">
            {otherEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Managed Clubs Section */}
        {managedClubs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Managed Clubs</h2>
              <Link href="/clubs/managed" className="text-blue-600 text-sm hover:underline">
                Manage all
              </Link>
            </div>
            <div className="space-y-4">
              {managedClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Club Card Component
function ClubCard({ club }: { club: Club }) {
  const getVisibilityIcon = () => {
    switch (club.visibility) {
      case 'public':
        return <Eye className="w-4 h-4 text-emerald-600" />;
      case 'private':
        return <Lock className="w-4 h-4 text-orange-600" />;
      case 'hidden':
        return <Lock className="w-4 h-4 text-red-600" />;
      default:
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Link href={`/clubs/${club.slug}`} className="block">
      <div className="card-clean p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {club.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{club.name}</h3>
              <p className="text-gray-600 text-sm">{club.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getVisibilityIcon()}
            {club.isOwner && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                Owner
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{club.memberCount} members</span>
          <span>{club.visibility}</span>
        </div>
        
        {club.description && (
          <p className="text-gray-600 text-sm mt-2">{club.description}</p>
        )}
      </div>
    </Link>
  );
}
