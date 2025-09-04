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
import Navigation from "../../components/Navigation";

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
    loadClubData();
  }, [params.slug]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadClubData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch club data by slug
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select(`
          id,
          name,
          slug,
          city,
          country,
          street,
          street_number,
          state,
          postal_code,
          visibility,
          description,
          icon,
          owner_id,
          created_at
        `)
        .eq('slug', params.slug)
        .single();

      if (clubError) {
        console.error('Error fetching club:', clubError);
        setLoading(false);
        return;
      }

      if (!clubData) {
        setLoading(false);
        return;
      }

      // Get club owner info
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', clubData.owner_id)
        .single();

      // Get events count for the owner
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubData.id);

      // Format address
      const addressParts = [
        clubData.street_number,
        clubData.street,
        clubData.city,
        clubData.state,
        clubData.country,
        clubData.postal_code
      ].filter(Boolean);
      const address = addressParts.join(', ');

      // Create club object
      const club: Club = {
        id: clubData.id,
        name: clubData.name,
        slug: clubData.slug,
        city: clubData.city,
        address: address || `${clubData.city}, ${clubData.country}`,
        visibility: clubData.visibility,
        description: clubData.description || "No description available",
        rules: "No Firearms, No flippers, casual dressing", // Default rules for now
        openingHours: "18:00H", // Default opening hours
        tables: 5, // Default table count
        image: clubData.icon || "/background.png",
        isOwner: user?.id === clubData.owner_id,
        host: {
          name: ownerData?.full_name || "Unknown Host",
          rating: 3, // Default rating
          eventsCreated: eventsCount || 0,
          avatar: ownerData?.avatar_url || "/images/default-avatar.png"
        }
      };

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          id,
          title,
          type,
          game_type,
          buyin,
          max_participants,
          starts_at,
          club_id
        `)
        .eq('club_id', clubData.id)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(3);

      const events: Event[] = (eventsData || []).map(event => ({
        id: event.id,
        title: event.title,
        type: event.type as "tournament" | "cash",
        gameType: event.game_type || "TNLH",
        buyin: event.buyin || 100,
        availableSeats: Math.max(0, (event.max_participants || 27) - 5), // Mock available seats
        totalSeats: event.max_participants || 27,
        date: new Date(event.starts_at).toLocaleDateString('en-GB'),
        image: "/background.png"
      }));

      // Fetch club members
      const { data: membersData } = await supabase
        .from('club_members')
        .select(`
          user_id,
          role,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('club_id', clubData.id)
        .limit(3);

      const members: Member[] = (membersData || []).map(member => ({
        id: member.user_id,
        name: member.profiles.full_name || "Unknown Member",
        eventsAttended: 212, // Mock data for now
        avatar: member.profiles.avatar_url || "/images/default-avatar.png",
        role: member.role as "owner" | "admin" | "member"
      }));

      setClub(club);
      setEvents(events);
      setMembers(members);
    } catch (error) {
      console.error('Error loading club data:', error);
    } finally {
      setLoading(false);
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
    <>
      <Navigation showBackButton={true} backHref="/clubs/managed" />
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-4">
        {/* Club Name Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
        </div>

        {/* Club Header Image - Half height */}
        <div className="relative mb-6">
          <div className="w-full h-32 bg-gradient-to-br from-green-600 to-green-800 rounded-xl overflow-hidden">
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
        </div>

        {/* Hosted by Section - Matching reference design */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                {club.host.avatar ? (
                  <img 
                    src={club.host.avatar} 
                    alt={club.host.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {club.host.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600">Hosted by</div>
                <div className="font-medium text-gray-900">{club.host.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
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

        {/* Club Description Section - Matching reference design */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Club Description</h3>
            {club.isOwner && (
              <Link href={`/clubs/${club.slug}/edit`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap">
                Edit Club
              </Link>
            )}
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-1 w-3/4">
              <p className="text-gray-600 text-sm leading-relaxed">{club.description}</p>
            </div>
            <div className="flex items-center gap-1 text-gray-600 w-1/4">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-sm">{club.address}</span>
            </div>
          </div>
        </div>

        {/* Club Rules Section - Matching reference design */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Club Rules</h3>
          <p className="text-gray-600 text-sm">{club.rules}</p>
        </div>

        {/* Upcoming Events Section - Matching second screenshot design */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Upcoming Events</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {events.map((event, index) => (
              <div key={event.id} className="flex-shrink-0 w-48">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-40">
                  {/* Colored Header */}
                  <div className={`h-16 flex items-center justify-center ${
                    index === 0 ? 'bg-green-600' : 
                    index === 1 ? 'bg-gray-600' : 
                    'bg-blue-600'
                  }`}>
                    <div className="text-center text-white">
                      <div className="text-lg font-bold">{event.title}</div>
                      <div className="text-xs opacity-90">{event.gameType}</div>
                    </div>
                  </div>
                  
                  {/* Event Details */}
                  <div className="p-3 h-24 flex flex-col justify-between">
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>BUYIN: ${event.buyin}</div>
                      <div>SEATS: {event.availableSeats}/{event.totalSeats}</div>
                      <div>DATE: {event.date}</div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="mt-2">
                      {club.isOwner ? (
                        <Link href={`/events/${event.id}/manage`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded text-center block transition-colors">
                          Manage
                        </Link>
                      ) : (
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors">
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members Section - Same size and shape cards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Members</h3>
            <Link href={`/clubs/${club.slug}/members`} className="text-blue-600 hover:underline text-sm">
              All members
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {members.map((member) => (
              <div key={member.id} className="flex-shrink-0 w-32">
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 text-xs mb-1">{member.name}</h4>
                  <p className="text-xs text-gray-600">Events Attended: {member.eventsAttended}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Club Button - Only visible to club owner */}
        {club.isOwner && (
          <div className="mt-8">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Club
            </button>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
