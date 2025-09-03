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
          loadMockData();
        } else if (user) {
          setUser(user);
          loadMockData();
        } else {
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
    // Mock upcoming event (main featured event)
    const mockUpcomingEvent: Event = {
      id: "1",
      title: "SUNDAY TOURNAMENT",
      type: "tournament",
      gameType: "TNLH",
      buyin: 100,
      date: "24/2/2021",
      time: "20:00",
      location: "Tel-Aviv, ISR",
      availableSeats: 5,
      totalSeats: 27,
      privacy: "private",
      host: {
        name: "John Dow",
        rating: 4,
        eventsCreated: 212
      },
      userStatus: "upcoming",
      isClubMember: true,
      image: "/background.png"
    };

    // Mock upcoming events for horizontal scrolling
    const mockUpcomingEvents: Event[] = [
      {
        id: "2",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 500,
        date: "24/3/2021",
        time: "20:00",
        location: "CLUB - ACE OF SPADE",
        availableSeats: 6,
        totalSeats: 27,
        privacy: "public",
        host: {
          name: "Club Host",
          rating: 4,
          eventsCreated: 150
        },
        userStatus: "upcoming",
        isClubMember: true,
        image: "/icon-app.png"
      },
      {
        id: "3",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 100,
        date: "25/3/2021",
        time: "19:00",
        location: "CLUB - KEVES HA KVASIM",
        availableSeats: 5,
        totalSeats: 27,
        privacy: "public",
        host: {
          name: "Club Host",
          rating: 4,
          eventsCreated: 89
        },
        userStatus: "upcoming",
        isClubMember: true,
        image: "/globe.svg"
      },
      {
        id: "4",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 200,
        date: "26/3/2021",
        time: "21:00",
        location: "Downtown Poker Club",
        availableSeats: 3,
        totalSeats: 20,
        privacy: "public",
        host: {
          name: "Local Host",
          rating: 4,
          eventsCreated: 67
        },
        userStatus: "upcoming",
        isClubMember: true,
        image: "/file.svg"
      }
    ];

    // Mock other events (public/private events)
    const mockOtherEvents: Event[] = [
      {
        id: "5",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 100,
        date: "24/2/2021",
        time: "20:00",
        location: "Public Poker Room",
        availableSeats: 5,
        totalSeats: 27,
        privacy: "public",
        host: {
          name: "Public Host",
          rating: 4,
          eventsCreated: 45
        },
        userStatus: "other",
        isClubMember: false,
        image: "/next.svg"
      },
      {
        id: "6",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 100,
        date: "25/2/2021",
        time: "19:00",
        location: "Private Club",
        availableSeats: 5,
        totalSeats: 27,
        privacy: "private",
        host: {
          name: "Private Host",
          rating: 4,
          eventsCreated: 78
        },
        userStatus: "other",
        isClubMember: false,
        image: "/vercel.svg"
      },
      {
        id: "7",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 150,
        date: "26/2/2021",
        time: "21:00",
        location: "Exclusive Poker Club",
        availableSeats: 2,
        totalSeats: 15,
        privacy: "private",
        host: {
          name: "Exclusive Host",
          rating: 5,
          eventsCreated: 120
        },
        userStatus: "other",
        isClubMember: false,
        image: "/window.svg"
      }
    ];

    // Mock registered events
    const mockRegisteredEvents: Event[] = [
      {
        id: "8",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 100,
        date: "24/2/2021",
        time: "20:00",
        location: "My Local Club",
        availableSeats: 5,
        totalSeats: 27,
        privacy: "private",
        host: {
          name: "Local Host",
          rating: 4,
          eventsCreated: 67
        },
        userStatus: "registered",
        isClubMember: true,
        image: "/icon-app.png"
      },
      {
        id: "9",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 100,
        date: "25/2/2021",
        time: "19:00",
        location: "Downtown Club",
        availableSeats: 5,
        totalSeats: 27,
        privacy: "public",
        host: {
          name: "Downtown Host",
          rating: 4,
          eventsCreated: 89
        },
        userStatus: "registered",
        isClubMember: true,
        image: "/background.png"
      },
      {
        id: "10",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 75,
        date: "26/2/2021",
        time: "18:00",
        location: "Neighborhood Club",
        availableSeats: 1,
        totalSeats: 15,
        privacy: "private",
        host: {
          name: "Neighbor Host",
          rating: 4,
          eventsCreated: 45
        },
        userStatus: "registered",
        isClubMember: true,
        image: "/globe.svg"
      }
    ];

    // Mock suggested clubs
    const mockSuggestedClubs: Club[] = [
      {
        id: "1",
        name: "ACE OF SPADE",
        slug: "ace-of-spade",
        city: "Tel-Aviv",
        visibility: "public",
        description: "Premium poker club with high stakes games",
        memberCount: 45,
        isOwner: false,
        image: "/icon-app.png"
      },
      {
        id: "2",
        name: "KEVES HA KVASIM",
        slug: "keves-ha-kvasim",
        city: "Jerusalem",
        visibility: "private",
        description: "Exclusive private poker club",
        memberCount: 23,
        isOwner: false,
        image: "/background.png"
      },
      {
        id: "3",
        name: "VEGAS ELITE",
        slug: "vegas-elite",
        city: "Las Vegas",
        visibility: "public",
        description: "High stakes poker club",
        memberCount: 67,
        isOwner: false,
        image: "/globe.svg"
      }
    ];

    setUpcomingEvent(mockUpcomingEvent);
    setUpcomingEvents(mockUpcomingEvents);
    setOtherEvents(mockOtherEvents);
    setRegisteredEvents(mockRegisteredEvents);
    setSuggestedClubs(mockSuggestedClubs);
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
        {upcomingEvent && (
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

        {/* Upcoming Events Section - Full width background header */}
        <div className="mb-8 -mx-4">
          <div className="bg-blue-600 text-white px-4 py-3 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming Events</h2>
              <Link href="/events/upcoming" className="text-blue-200 text-sm hover:underline">
                more
              </Link>
            </div>
          </div>
          <div className="px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex-shrink-0 w-48">
                  <EventCard event={event} variant="upcoming" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Other Events Section - Full width background header */}
        <div className="mb-8 -mx-4">
          <div className="bg-green-600 text-white px-4 py-3 mb-4">
            <h2 className="text-lg font-semibold">Other Events</h2>
          </div>
          <div className="px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {otherEvents.map((event) => (
                <div key={event.id} className="flex-shrink-0 w-48">
                  <EventCard event={event} variant="other" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registered Events Section - Full width background header */}
        <div className="mb-8 -mx-4">
          <div className="bg-pink-600 text-white px-4 py-3 mb-4">
            <h2 className="text-lg font-semibold">Registered Events</h2>
          </div>
          <div className="px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {registeredEvents.map((event) => (
                <div key={event.id} className="flex-shrink-0 w-48">
                  <EventCard event={event} variant="registered" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Clubs Section - Full width background header */}
        <div className="mb-8 -mx-4">
          <div className="bg-purple-600 text-white px-4 py-3 mb-4">
            <h2 className="text-lg font-semibold">Suggested Clubs</h2>
          </div>
          <div className="px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {suggestedClubs.map((club) => (
                <div key={club.id} className="flex-shrink-0 w-48">
                  <ClubCard club={club} />
                </div>
              ))}
            </div>
          </div>
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
