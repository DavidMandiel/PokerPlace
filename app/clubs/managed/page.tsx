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
  Star,
  ArrowLeft,
  Trash2,
  AlertTriangle
} from "lucide-react";
import Navigation from "../../components/Navigation";

interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const handleDeleteClub = async (clubId: string, clubName: string) => {
    if (deleteConfirm !== clubId) {
      setDeleteConfirm(clubId);
      return;
    }

    try {
      setDeleting(clubId);
      
      const response = await fetch(`/api/clubs/${clubId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete club');
      }

      // Remove club from local state
      setClubs(clubs.filter(club => club.id !== clubId));
      setDeleteConfirm(null);
      
      // Show success message (you could add a toast notification here)
      console.log(`Club "${clubName}" deleted successfully`);
      
    } catch (error) {
      console.error('Error deleting club:', error);
      alert(`Error deleting club: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleting(clubId);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
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

      <div className="max-w-6xl mx-auto px-6 py-4">
        {/* Stats Summary */}
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
            <div className="text-lg font-bold text-purple-600">
              {clubs.reduce((sum, club) => sum + club.upcomingEventsCount, 0)}
            </div>
            <div className="text-xs text-gray-600">Upcoming Events</div>
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
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {club.icon ? (
                      <img 
                        src={club.icon} 
                        alt={club.name}
                        className="w-full h-full object-cover"
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
                    <Link href={`/clubs/${club.slug}/members`} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors">
                      <Users className="w-5 h-5" />
                      <span className="text-sm font-medium">{club.memberCount} members</span>
                    </Link>

                    {/* Upcoming Events - Linked to Events Page */}
                    <Link href={`/clubs/${club.slug}/events`} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm font-medium">{club.upcomingEventsCount} upcoming events</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit Club Button */}
                    <Link href={`/clubs/${club.slug}/edit`} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>

                    {/* Create New Event Button */}
                    <Link href={`/clubs/${club.slug}/events/new`} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      New Event
                    </Link>

                    {/* Delete Club Button */}
                    {deleteConfirm === club.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteClub(club.id, club.name)}
                          disabled={deleting === club.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          {deleting === club.id ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(club.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
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

