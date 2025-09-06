"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Search, 
  MapPin, 
  User, 
  Calendar, 
  Filter, 
  CalendarDays,
  Users,
  Star,
  Clock,
  DollarSign
} from "lucide-react";
import Navigation from "../../components/Navigation";
import EventCard, { Event } from "../../components/EventCard";

interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  visibility: "public" | "private" | "hidden";
  description?: string;
  memberCount: number;
  isOwner: boolean;
  image?: string;
  host: {
    name: string;
    rating: number;
    eventsCreated: number;
    avatar?: string;
  };
}

interface SearchFilters {
  searchMode: "club" | "event";
  clubName: string;
  hostName: string;
  location: string;
  eventType: "tournament" | "cash" | "all";
  gameType: "TNLH" | "PLO" | "7CS" | "Mixed" | "all";
  startDate: string;
  endDate: string;
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [searchResults, setSearchResults] = useState<{
    clubs: Club[];
    events: Event[];
  }>({ clubs: [], events: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse search parameters from URL
    const parsedFilters: SearchFilters = {
      searchMode: (searchParams.get('searchMode') as "club" | "event") || "club",
      clubName: searchParams.get('clubName') || "",
      hostName: searchParams.get('hostName') || "",
      location: searchParams.get('location') || "",
      eventType: (searchParams.get('eventType') as "tournament" | "cash" | "all") || "all",
      gameType: (searchParams.get('gameType') as "TNLH" | "PLO" | "7CS" | "Mixed" | "all") || "all",
      startDate: searchParams.get('startDate') || "",
      endDate: searchParams.get('endDate') || ""
    };
    
    setFilters(parsedFilters);
    performSearch(parsedFilters);
  }, [searchParams]);

  const performSearch = async (searchFilters: SearchFilters) => {
    setLoading(true);
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let clubs: Club[] = [];
      let events: Event[] = [];

      if (searchFilters.searchMode === "club") {
        // Search clubs
        let clubsQuery = supabase
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
            owner_id,
            created_at
          `);

        // Apply filters
        if (searchFilters.clubName) {
          clubsQuery = clubsQuery.ilike('name', `%${searchFilters.clubName}%`);
        }

        if (searchFilters.location) {
          clubsQuery = clubsQuery.or(`city.ilike.%${searchFilters.location}%,country.ilike.%${searchFilters.location}%`);
        }

        // Note: Host name filtering will be done after fetching user profiles

        if (searchFilters.startDate) {
          clubsQuery = clubsQuery.gte('created_at', searchFilters.startDate);
        }

        if (searchFilters.endDate) {
          clubsQuery = clubsQuery.lte('created_at', searchFilters.endDate);
        }

        const { data: clubsData, error: clubsError } = await clubsQuery;

        if (clubsError) {
          console.error('Error fetching clubs:', clubsError);
        } else if (clubsData && clubsData.length > 0) {
          // Get unique owner IDs
          const ownerIds = [...new Set(clubsData.map(club => club.owner_id))];
          
          // Fetch user profiles for owners
          const { data: ownerProfiles } = await supabase
            .from('user_profiles')
            .select('id, first_name, last_name, nickname')
            .in('id', ownerIds);

          // Create a map for quick lookup
          const profilesMap = new Map(ownerProfiles?.map(profile => [profile.id, profile]) || []);

          let filteredClubs = clubsData;

          // Apply host name filter if specified
          if (searchFilters.hostName) {
            filteredClubs = clubsData.filter(club => {
              const ownerProfile = profilesMap.get(club.owner_id);
              if (!ownerProfile) return false;
              
              const fullName = `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim();
              const nickname = ownerProfile.nickname || '';
              const searchTerm = searchFilters.hostName.toLowerCase();
              
              return fullName.toLowerCase().includes(searchTerm) || 
                     nickname.toLowerCase().includes(searchTerm);
            });
          }

          // Get member counts for each club
          const clubsWithMembers = await Promise.all(
            filteredClubs.map(async (club) => {
              const { count: memberCount } = await supabase
                .from('club_members')
                .select('*', { count: 'exact', head: true })
                .eq('club_id', club.id);

              const { count: eventsCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('club_id', club.id);

              const ownerProfile = profilesMap.get(club.owner_id);

              return {
                id: club.id,
                name: club.name,
                slug: club.slug,
                location: `${club.city}, ${club.country}`,
                visibility: club.visibility,
                description: club.description,
                memberCount: memberCount || 0,
                isOwner: false, // TODO: Check if current user is owner
                image: club.icon || "/background.png",
                host: {
                  name: ownerProfile ? 
                    `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() || 
                    ownerProfile.nickname || "Unknown Host" : "Unknown Host",
                  rating: 4, // Default rating
                  eventsCreated: eventsCount || 0,
                  avatar: "/images/default-avatar.png"
                }
              };
            })
          );

          clubs = clubsWithMembers;
        }
      } else {
        // Search events
        let eventsQuery = supabase
          .from('events')
          .select(`
            id,
            name,
            event_type,
            game_type,
            buyin,
            max_players,
            starts_at,
            club_id,
            created_by,
            clubs!inner(name, city, country)
          `);

        // Apply filters
        if (searchFilters.clubName) {
          eventsQuery = eventsQuery.ilike('name', `%${searchFilters.clubName}%`);
        }

        // Note: Host name filtering will be done after fetching user profiles

        if (searchFilters.location) {
          eventsQuery = eventsQuery.or(`clubs.city.ilike.%${searchFilters.location}%,clubs.country.ilike.%${searchFilters.location}%`);
        }

        if (searchFilters.eventType !== "all") {
          eventsQuery = eventsQuery.eq('event_type', searchFilters.eventType);
        }

        if (searchFilters.gameType !== "all") {
          eventsQuery = eventsQuery.eq('game_type', searchFilters.gameType);
        }

        if (searchFilters.startDate) {
          eventsQuery = eventsQuery.gte('starts_at', searchFilters.startDate);
        }

        if (searchFilters.endDate) {
          eventsQuery = eventsQuery.lte('starts_at', searchFilters.endDate);
        }

        const { data: eventsData, error: eventsError } = await eventsQuery;

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
        } else if (eventsData && eventsData.length > 0) {
          // Get unique creator IDs
          const creatorIds = [...new Set(eventsData.map(event => event.created_by))];
          
          // Fetch user profiles for creators
          const { data: creatorProfiles } = await supabase
            .from('user_profiles')
            .select('id, first_name, last_name, nickname')
            .in('id', creatorIds);

          // Create a map for quick lookup
          const profilesMap = new Map(creatorProfiles?.map(profile => [profile.id, profile]) || []);

          let filteredEvents = eventsData;

          // Apply host name filter if specified
          if (searchFilters.hostName) {
            filteredEvents = eventsData.filter(event => {
              const creatorProfile = profilesMap.get(event.created_by);
              if (!creatorProfile) return false;
              
              const fullName = `${creatorProfile.first_name || ''} ${creatorProfile.last_name || ''}`.trim();
              const nickname = creatorProfile.nickname || '';
              const searchTerm = searchFilters.hostName.toLowerCase();
              
              return fullName.toLowerCase().includes(searchTerm) || 
                     nickname.toLowerCase().includes(searchTerm);
            });
          }

          events = filteredEvents.map(event => {
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
              privacy: "public" as const, // Default privacy
              host: {
                name: creatorProfile ? 
                  `${creatorProfile.first_name || ''} ${creatorProfile.last_name || ''}`.trim() || 
                  creatorProfile.nickname || "Unknown Host" : "Unknown Host",
                rating: 4, // Default rating
                eventsCreated: 0 // TODO: Get actual count
              },
              userStatus: "other" as const,
              isClubMember: false, // TODO: Check if user is club member
              image: "/background.png"
            };
          });
        }
      }

      setSearchResults({ clubs, events });
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults({ clubs: [], events: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation showBackButton={true} backHref="/search" />
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 py-4">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="spinner-clean h-8 w-8 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!filters) {
    return (
      <>
        <Navigation showBackButton={true} backHref="/search" />
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 py-4">
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 mb-2">No search parameters found</h1>
              <Link href="/search" className="text-blue-600 hover:underline">Back to search</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const totalResults = searchResults.clubs.length + searchResults.events.length;

  return (
    <>
      <Navigation showBackButton={true} backHref="/search" />
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h1>
            <p className="text-gray-600">
              Found {totalResults} {filters.searchMode === "club" ? "clubs" : "events"} 
              {totalResults === 1 ? "" : "s"}
            </p>
          </div>

          {/* Active Filters Display */}
          {(filters.clubName || filters.hostName || filters.location || filters.eventType !== "all" || filters.gameType !== "all" || filters.startDate || filters.endDate) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Search Filters:</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <div>Search Mode: {filters.searchMode === "club" ? "Clubs" : "Events"}</div>
                {filters.clubName && <div>{filters.searchMode === "club" ? "Club" : "Event"}: {filters.clubName}</div>}
                {filters.hostName && <div>{filters.searchMode === "club" ? "Host" : "Organizer"}: {filters.hostName}</div>}
                {filters.location && <div>Location: {filters.location}</div>}
                {filters.searchMode === "event" && filters.eventType !== "all" && <div>Event Type: {filters.eventType}</div>}
                {filters.searchMode === "event" && filters.gameType !== "all" && <div>Game Type: {filters.gameType}</div>}
                {filters.startDate && <div>From Date: {new Date(filters.startDate).toLocaleDateString()}</div>}
                {filters.endDate && <div>To Date: {new Date(filters.endDate).toLocaleDateString()}</div>}
              </div>
            </div>
          )}

          {/* Results */}
          {totalResults === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
              <Link href="/search" className="text-blue-600 hover:underline">Modify search</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Club Results */}
              {filters.searchMode === "club" && searchResults.clubs.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Clubs ({searchResults.clubs.length})</h2>
                  <div className="grid gap-4">
                    {searchResults.clubs.map((club) => (
                      <ClubResultCard key={club.id} club={club} />
                    ))}
                  </div>
                </div>
              )}

              {/* Event Results */}
              {filters.searchMode === "event" && searchResults.events.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Events ({searchResults.events.length})</h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {searchResults.events.map((event) => (
                      <div key={event.id} className="flex-shrink-0 w-48">
                        <EventCard event={event} variant="other" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Club Result Card Component
function ClubResultCard({ club }: { club: Club }) {
  return (
    <Link href={`/clubs/${club.slug}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          {/* Club Image */}
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg overflow-hidden flex-shrink-0">
            {club.image ? (
              <img 
                src={club.image} 
                alt={club.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{club.name.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Club Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg mb-1">{club.name}</h3>
            <div className="flex items-center gap-1 text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{club.city}, {club.country}</span>
            </div>
            
            {club.description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{club.description}</p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{club.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{club.host.rating}/5</span>
                </div>
              </div>
              <span className="capitalize text-xs bg-gray-100 px-2 py-1 rounded">
                {club.visibility}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
