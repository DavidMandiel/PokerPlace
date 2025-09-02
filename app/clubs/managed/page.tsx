"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  Edit, 
  Plus,
  MapPin,
  Star,
  ArrowLeft
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
  visibility: "public" | "private" | "hidden";
  description?: string;
  memberCount: number;
  upcomingEventsCount: number;
  image?: string;
}

export default function ManagedClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMockData();
    setLoading(false);
  }, []);

  const loadMockData = () => {
    // Mock managed clubs data
    const mockManagedClubs: Club[] = [
      {
        id: "1",
        name: "ACE OF SPADE",
        slug: "ace-of-spade",
        city: "Tel-Aviv",
        visibility: "public",
        description: "Premium poker club with high stakes games and tournaments",
        memberCount: 45,
        upcomingEventsCount: 3,
        image: "/icon-app.png"
      },
      {
        id: "2",
        name: "KEVES HA KVASIM",
        slug: "keves-ha-kvasim",
        city: "Jerusalem",
        visibility: "private",
        description: "Exclusive private poker club for serious players",
        memberCount: 23,
        upcomingEventsCount: 1,
        image: "/background.png"
      },
      {
        id: "3",
        name: "VEGAS ELITE",
        slug: "vegas-elite",
        city: "Las Vegas",
        visibility: "public",
        description: "High stakes poker club with professional atmosphere",
        memberCount: 67,
        upcomingEventsCount: 5,
        image: "/globe.svg"
      },
      {
        id: "4",
        name: "DOWNTOWN POKER",
        slug: "downtown-poker",
        city: "New York",
        visibility: "public",
        description: "Friendly neighborhood poker club for all skill levels",
        memberCount: 34,
        upcomingEventsCount: 2,
        image: "/file.svg"
      }
    ];

    setClubs(mockManagedClubs);
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

  return (
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
              <p className="text-gray-600 text-sm">Manage your poker clubs and events</p>
            </div>
          </div>
          <Link href="/clubs/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Club
          </Link>
        </div>
      </div>

      <div className="container-mobile p-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{clubs.length}</div>
            <div className="text-sm text-gray-600">Total Clubs</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {clubs.reduce((sum, club) => sum + club.memberCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {clubs.reduce((sum, club) => sum + club.upcomingEventsCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </div>
        </div>

        {/* Clubs List */}
        <div className="space-y-4">
          {clubs.map((club) => (
            <div key={club.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                {/* Club Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Club Logo */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    {club.image ? (
                      <img 
                        src={club.image} 
                        alt={club.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {club.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Club Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{club.name}</h3>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{club.city}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        club.visibility === 'public' 
                          ? 'bg-green-100 text-green-800' 
                          : club.visibility === 'private'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {club.visibility === 'public' ? 'Public' : club.visibility === 'private' ? 'Private' : 'Hidden'}
                      </span>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </div>

                    {club.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{club.description}</p>
                    )}
                  </div>
                </div>

                {/* Club Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Members Count - Linked to Members Page */}
                    <Link href={`/clubs/${club.slug}/members`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Users className="w-5 h-5" />
                      <span className="text-sm font-medium">{club.memberCount} members</span>
                    </Link>

                    {/* Upcoming Events - Linked to Events Page */}
                    <Link href={`/clubs/${club.slug}/events`} className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm font-medium">{club.upcomingEventsCount} upcoming events</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit Club Button */}
                    <Link href={`/clubs/${club.slug}/edit`} className="btn-secondary flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Club
                    </Link>

                    {/* Create New Event Button */}
                    <Link href={`/clubs/${club.slug}/events/new`} className="btn-primary flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      New Event
                    </Link>
                  </div>
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
            <Link href="/clubs/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Club
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

