"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Search, Calendar, CheckCircle } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import EventCard, { Event } from "../components/EventCard";

type User = SupabaseUser;

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
      title: "High Roller Tournament",
      type: "tournament",
      gameType: "TNLH",
      buyin: 500,
      date: "Jan 7",
      time: "5:00 PM",
      location: "456 Casino Blvd, Las Vegas, NV 89101",
      availableSeats: 8,
      totalSeats: 20,
      privacy: "private",
      host: {
        name: "John Dow",
        rating: 4,
        eventsCreated: 212
      },
      userStatus: "upcoming",
      isClubMember: true
    };

    const mockFriendsEvents: Event[] = [
      {
        id: "2",
        title: "Monday Night NL Tournament",
        type: "tournament",
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
      }
    ];

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
      }
    ];

    const mockRegisteredEvents: Event[] = [
      {
        id: "5",
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
      }
    ];

    setUpcomingEvent(mockUpcomingEvent);
    setFriendsEvents(mockFriendsEvents);
    setOtherEvents(mockOtherEvents);
    setRegisteredEvents(mockRegisteredEvents);
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

  if (!user) {
    return null;
  }

  const displayName = user.user_metadata?.nickname || 
                     user.user_metadata?.first_name || 
                     user.email?.split('@')[0] || 
                     'User';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container-mobile">
        {/* Header */}
        <div className="mb-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Hi {displayName}</h1>
                <p className="text-gray-600 text-sm">Find Events, Browse Clubs, See Your Friends</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="input-clean pl-10 pr-4 py-2 text-sm"
              />
            </div>
          </div>

          {/* Upcoming Event Card */}
          {upcomingEvent && (
            <div className="card-clean p-4 mb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{upcomingEvent.title}</h2>
                    <p className="text-red-500 text-sm font-medium">START IN: 2 DAYS</p>
                  </div>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-600 text-sm">{upcomingEvent.gameType}</p>
                <p className="text-gray-600 text-sm">BUYIN: ${upcomingEvent.buyin}</p>
                <p className="text-gray-600 text-sm">AVAILABLE SEATS: {upcomingEvent.availableSeats}/{upcomingEvent.totalSeats}</p>
                <p className="text-gray-600 text-sm">DATE: {upcomingEvent.date}</p>
              </div>
            </div>
          )}
        </div>

        {/* Friends Events */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Friends Events</h2>
            <Link href="/events/friends" className="text-blue-600 text-sm hover:underline">
              more
            </Link>
          </div>
          <div className="space-y-4">
            {friendsEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Other Events */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Other Events</h2>
            <Link href="/events" className="text-blue-600 text-sm hover:underline">
              more
            </Link>
          </div>
          <div className="space-y-4">
            {otherEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Registered Events */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Registered Events</h2>
            <Link href="/events/registered" className="text-blue-600 text-sm hover:underline">
              more
            </Link>
          </div>
          <div className="space-y-4">
            {registeredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
