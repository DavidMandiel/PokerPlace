"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  Star, 
  Users, 
  Calendar,
  ChevronRight,
  X
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  visibility: "public" | "private" | "hidden";
  description: string;
  rules: string;
  openingHours: string;
  tables: number;
  image?: string;
  isOwner: boolean;
  host: {
    name: string;
    rating: number;
    eventsCreated: number;
    avatar?: string;
  };
}

interface Event {
  id: string;
  title: string;
  type: "tournament" | "cash";
  gameType: string;
  buyin: number;
  availableSeats: number;
  totalSeats: number;
  date: string;
  image?: string;
}

interface Member {
  id: string;
  name: string;
  eventsAttended: number;
  avatar?: string;
  role: "owner" | "admin" | "member";
}

export default function ClubDetailPage({ params }: { params: { slug: string } }) {
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadMockData();
    setLoading(false);
  }, [params.slug]);

  const loadMockData = () => {
    // Mock club data based on the image
    const mockClub: Club = {
      id: "1",
      name: "The ACE Of Base",
      slug: params.slug,
      city: "Celina",
      address: "6391 Elgin St. Celina, Delaware 10299",
      visibility: "public",
      description: "A friendly social club for recreational Poker player, mainly Tournaments. 5 Tables each night. Open from 18:00H",
      rules: "No Firearms, No flippers, casual dressing",
      openingHours: "18:00H",
      tables: 5,
      image: "/background.png",
      isOwner: true, // This would be determined by user authentication
      host: {
        name: "John Dow",
        rating: 3,
        eventsCreated: 212,
        avatar: "/images/john-dow.jpg"
      }
    };

    // Mock upcoming events
    const mockEvents: Event[] = [
      {
        id: "1",
        title: "TNLH TOURNAMENT",
        type: "tournament",
        gameType: "TNLH",
        buyin: 100,
        availableSeats: 5,
        totalSeats: 27,
        date: "24/2/2021",
        image: "/background.png"
      },
      {
        id: "2",
        title: "TNLH CASH",
        type: "cash",
        gameType: "TNLH",
        buyin: 100,
        availableSeats: 5,
        totalSeats: 27,
        date: "24/2/2021",
        image: "/globe.svg"
      },
      {
        id: "3",
        title: "TNLH CAS",
        type: "cash",
        gameType: "TNLH",
        buyin: 100,
        availableSeats: 5,
        totalSeats: 27,
        date: "24/2/2021",
        image: "/file.svg"
      }
    ];

    // Mock members
    const mockMembers: Member[] = [
      {
        id: "1",
        name: "John Dow",
        eventsAttended: 212,
        avatar: "/images/john-dow.jpg",
        role: "owner"
      },
      {
        id: "2",
        name: "Jane Dow",
        eventsAttended: 212,
        avatar: "/images/jane-dow.jpg",
        role: "admin"
      },
      {
        id: "3",
        name: "Jane Dow",
        eventsAttended: 212,
        avatar: "/images/jane-dow-2.jpg",
        role: "member"
      }
    ];

    setClub(mockClub);
    setEvents(mockEvents);
    setMembers(mockMembers);
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

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Club not found</h1>
          <Link href="/clubs" className="text-blue-600 hover:underline">Back to clubs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/clubs" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{club.name}</h1>
          </div>
          
          {/* EDIT and DELETE buttons - Only visible to club owner */}
          {club.isOwner && (
            <div className="flex items-center gap-2">
              <Link href={`/clubs/${club.slug}/edit`} className="btn-secondary flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button className="btn-danger flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Club
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container-mobile p-4">
        {/* Club Header Image */}
        <div className="relative mb-6">
          <div className="w-full h-48 bg-gradient-to-br from-green-600 to-green-800 rounded-xl overflow-hidden">
            {club.image ? (
              <img 
                src={club.image} 
                alt={club.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">{club.name.charAt(0)}</span>
              </div>
            )}
          </div>
          
          {/* Edit button overlay - Only visible to club owner */}
          {club.isOwner && (
            <div className="absolute top-4 right-4">
              <Link href={`/clubs/${club.slug}/edit`} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
          )}
        </div>

        {/* Hosted by Section */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">Hosted by</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {club.host.avatar ? (
                <img 
                  src={club.host.avatar} 
                  alt={club.host.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {club.host.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">{club.host.name}</div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>Rated:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < club.host.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600">Events Created: {club.host.eventsCreated}</div>
            </div>
          </div>
        </div>

        {/* Club Description Section */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">Club Description</h2>
          <div className="flex items-start gap-3">
            <p className="text-gray-600 flex-1">{club.description}</p>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-sm">{club.address}</span>
            </div>
          </div>
        </div>

        {/* Club Rules Section */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">Club Rules</h2>
          <p className="text-gray-600">{club.rules}</p>
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">Upcoming Events</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {events.map((event) => (
              <div key={event.id} className="flex-shrink-0 w-48">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Event Image */}
                  <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    {event.image ? (
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">{event.gameType}</span>
                      </div>
                    )}
                    
                    {/* Manage button - Only visible to club owner */}
                    {club.isOwner && (
                      <div className="absolute top-2 right-2">
                        <Link href={`/events/${event.id}/manage`} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors">
                          <Edit className="w-3 h-3" />
                          Manage
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-sm mb-2">{event.title}</h3>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>BUYIN: ${event.buyin}</div>
                      <div>AVAILABLE SEATS: {event.availableSeats} / {event.totalSeats}</div>
                      <div>DATE: {event.date}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Members</h2>
            <Link href={`/clubs/${club.slug}/members`} className="text-blue-600 hover:underline text-sm">
              All members
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {members.map((member) => (
              <div key={member.id} className="flex-shrink-0 w-32">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative">
                  {/* Member Avatar */}
                  <div className="h-20 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Member Details */}
                  <div className="p-2 text-center">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">{member.name}</h3>
                    <p className="text-xs text-gray-600">Events Attended: {member.eventsAttended}</p>
                  </div>

                  {/* Action Icons - Only visible to club owner */}
                  {club.isOwner && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full transition-colors">
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Club Button - Only visible to club owner */}
        {club.isOwner && (
          <div className="mt-6">
            <button className="w-full btn-danger flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Club
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
