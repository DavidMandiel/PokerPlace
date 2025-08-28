"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Calendar, MapPin, Users, Clock, Plus } from "lucide-react";

type EventListItem = {
  id: string;
  clubSlug: string;
  name: string;
  startsAt: string;
  venue: string;
  city?: string;
  visibility: "public" | "private";
  maxPlayers?: number | null;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    (async () => {
      const { data } = await supabase
        .from("events")
        .select("id, name, starts_at, venue, visibility, max_players, clubs ( slug )")
        .order("starts_at", { ascending: true })
        .gte("starts_at", new Date().toISOString());
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        clubSlug: row.clubs?.slug ?? "",
        name: row.name,
        startsAt: row.starts_at,
        venue: row.venue,
        visibility: row.visibility,
        maxPlayers: row.max_players,
      }));
      setEvents(mapped);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="bg-app space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Upcoming Events</h1>
          <p className="text-emerald-mintSoft mt-1">
            Find and join poker events in your area
          </p>
        </div>
        <Link 
          href="/clubs" 
          className="text-emerald-mintSoft hover:text-emerald-mint hover:underline underline-offset-4 transition-colors"
        >
          Create event via your club →
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
          <p className="text-emerald-mintSoft">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 card-emerald">
          <Calendar className="w-12 h-12 text-emerald-mint mx-auto mb-4 animate-bounce-subtle" />
          <h3 className="text-lg font-semibold mb-2 text-gradient">No upcoming events</h3>
          <p className="text-emerald-mintSoft mb-4">
            Check back later or create an event in your club
          </p>
          <Link
            href="/clubs"
            className="btn-accent rounded-xl px-6 py-3 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Browse Clubs
          </Link>
        </div>
      ) : (
        <div className="space-y-4 animate-slide-up">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`group p-6 rounded-2xl border transition-all duration-300 ease-soft hover:scale-[1.02] hover:-translate-y-1 ${
                index % 3 === 0 ? 'card-emerald' : 
                index % 3 === 1 ? 'card-teal' : 'card-olive'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-glow mb-2">
                    {event.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-emerald-mintSoft mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(event.startsAt), "EEE, MMM d • p")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    {event.maxPlayers && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Max {event.maxPlayers} players</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      event.visibility === 'public' 
                        ? 'bg-emerald-mint/20 text-emerald-mint' 
                        : 'bg-teal-accent/20 text-teal-accent'
                    }`}>
                      {event.visibility === 'public' ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/clubs/${event.clubSlug}`}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ease-soft ${
                    index % 3 === 0 ? 'btn-emerald' : 
                    index % 3 === 1 ? 'btn-teal' : 'btn-olive'
                  }`}
                >
                  View Club
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


