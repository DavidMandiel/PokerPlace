"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Search, MapPin, Info, Clock, Users, Calendar, Crown, CheckCircle, XCircle } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = SupabaseUser;

type Event = {
  id: string;
  title: string;
  type: "tournament" | "cash";
  gameType: string;
  buyin: number;
  date: string;
  time: string;
  availableSeats: number;
  totalSeats: number;
  image?: string;
  host: {
    name: string;
    rating: number;
    eventsCreated: number;
  };
  status: "upcoming" | "friends" | "other" | "registered";
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingEvent, setUpcomingEvent] = useState<Event | null>(null);
  const [friendsEvents, setFriendsEvents] = useState<Event[]>([]);
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchEvents();
      } else {
        window.location.href = '/auth';
      }
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  const fetchEvents = async () => {
    // Mock data for now - replace with actual API calls
    const mockUpcomingEvent: Event = {
      id: "1",
      title: "SUNDAY TOURNAMENT",
      type: "tournament",
      gameType: "TNLH",
      buyin: 100,
      date: "24/2/2021",
      time: "20:00",
      availableSeats: 5,
      totalSeats: 27,
      host: {
        name: "John Dow",
        rating: 4,
        eventsCreated: 212
      },
      status: "upcoming"
    };

    const mockFriendsEvents: Event[] = [
      {
        id: "2",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 100,
        date: "24/2/2021",
        time: "19:00",
        availableSeats: 3,
        totalSeats: 9,
        host: {
          name: "Mike Smith",
          rating: 5,
          eventsCreated: 45
        },
        status: "friends"
      },
      {
        id: "3",
        title: "OMAHA CASH",
        type: "cash",
        gameType: "PLO",
        buyin: 200,
        date: "25/2/2021",
        time: "21:00",
        availableSeats: 2,
        totalSeats: 8,
        host: {
          name: "Sarah Johnson",
          rating: 4,
          eventsCreated: 78
        },
        status: "friends"
      }
    ];

    const mockOtherEvents: Event[] = [
      {
        id: "4",
        title: "MONDAY NIGHT NL",
        type: "tournament",
        gameType: "TNLH",
        buyin: 150,
        date: "26/2/2021",
        time: "20:00",
        availableSeats: 8,
        totalSeats: 30,
        host: {
          name: "David Wilson",
          rating: 3,
          eventsCreated: 23
        },
        status: "other"
      }
    ];

    const mockRegisteredEvents: Event[] = [
      {
        id: "5",
        title: "WEEKEND SPECIAL",
        type: "tournament",
        gameType: "TNLH",
        buyin: 300,
        date: "28/2/2021",
        time: "18:00",
        availableSeats: 12,
        totalSeats: 50,
        host: {
          name: "Lisa Brown",
          rating: 5,
          eventsCreated: 156
        },
        status: "registered"
      }
    ];

    setUpcomingEvent(mockUpcomingEvent);
    setFriendsEvents(mockFriendsEvents);
    setOtherEvents(mockOtherEvents);
    setRegisteredEvents(mockRegisteredEvents);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
          <p className="text-emerald-mintSoft">Loading...</p>
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

  const EventCard = ({ event, showRegister = true }: { event: Event; showRegister?: boolean }) => (
    <Link href={`/events/${event.id}`} className="block">
      <div className="bg-white/5 rounded-xl p-4 min-w-[280px] border border-emerald-mint/10 hover:bg-white/10 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-glow text-sm">{event.title}</h3>
            <p className="text-emerald-mintSoft text-xs">{event.gameType}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-mintSoft">BUYIN: ${event.buyin}</span>
          </div>
        </div>
        
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs text-emerald-mintSoft">
            <span>AVAILABLE SEATS: {event.availableSeats}/{event.totalSeats}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-mintSoft">
            <span>DATE: {event.date}</span>
          </div>
        </div>

        {showRegister && (
          <div className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors text-center">
            REGISTER
          </div>
        )}
      </div>
    </Link>
  );

  const RegisteredEventCard = ({ event }: { event: Event }) => (
    <Link href={`/events/${event.id}`} className="block">
      <div className="bg-white/5 rounded-xl p-4 min-w-[280px] border border-emerald-mint/10 hover:bg-white/10 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-glow text-sm">{event.title}</h3>
            <p className="text-emerald-mintSoft text-xs">{event.gameType}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-mintSoft">BUYIN: ${event.buyin}</span>
          </div>
        </div>
        
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs text-emerald-mintSoft">
            <span>AVAILABLE SEATS: {event.availableSeats}/{event.totalSeats}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-mintSoft">
            <span>DATE: {event.date}</span>
          </div>
        </div>

        <div className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors text-center">
          UNREGISTER
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-app p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-mint/20 rounded-full flex items-center justify-center">
              <span className="text-emerald-mint font-semibold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-glow">Hi {displayName}</h1>
              <p className="text-emerald-mintSoft text-sm">Your Up-Coming Event</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-mintSoft w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-white/5 border border-emerald-mint/20 rounded-lg pl-10 pr-4 py-2 text-sm text-emerald-mintSoft placeholder-emerald-mintSoft/50 focus:outline-none focus:border-emerald-mint/40"
            />
          </div>
        </div>

        {/* Upcoming Event Card */}
        {upcomingEvent && (
          <div className="bg-gradient-to-r from-emerald-dark/50 to-teal-dark/50 rounded-xl p-4 border border-emerald-mint/20 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-mint/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-mint" />
                </div>
                <div>
                  <h2 className="font-bold text-glow text-lg">{upcomingEvent.title}</h2>
                  <p className="text-red-400 text-sm font-medium">START IN: 2 DAYS</p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-emerald-mintSoft text-xs">{upcomingEvent.gameType}</p>
                <p className="text-emerald-mintSoft text-xs">BUYIN: ${upcomingEvent.buyin}</p>
                <p className="text-emerald-mintSoft text-xs">AVAILABLE SEATS: {upcomingEvent.availableSeats}/{upcomingEvent.totalSeats}</p>
                <p className="text-emerald-mintSoft text-xs">DATE: {upcomingEvent.date}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2">
              <MapPin className="w-4 h-4 text-emerald-mintSoft" />
              <Info className="w-4 h-4 text-emerald-mintSoft" />
            </div>
          </div>
        )}
      </div>

      {/* Friends Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-glow">Friends Events</h2>
          <Link href="/events/friends" className="text-emerald-mint text-sm hover:underline">
            more
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {friendsEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* Other Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-glow">Other Events</h2>
          <Link href="/events" className="text-emerald-mint text-sm hover:underline">
            more
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {otherEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* Registered Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-glow">Registered Events</h2>
          <Link href="/events/registered" className="text-emerald-mint text-sm hover:underline">
            more
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {registeredEvents.map((event) => (
            <RegisteredEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
