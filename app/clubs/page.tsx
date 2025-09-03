"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Plus, Users, MapPin, Eye, EyeOff, Lock } from "lucide-react";
import Navigation from "../components/Navigation";

type Club = {
  id: string;
  name: string;
  slug: string;
  city: string;
  visibility: "public" | "private" | "hidden";
  description?: string | null;
};

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    (async () => {
      const { data } = await supabase
        .from("clubs")
        .select("id, name, slug, city, visibility, description")
        .order("name", { ascending: true });
      setClubs(data || []);
      setLoading(false);
    })();
  }, []);

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Eye className="w-4 h-4 text-emerald-mint" />;
      case 'private':
        return <Lock className="w-4 h-4 text-teal-accent" />;
      case 'hidden':
        return <EyeOff className="w-4 h-4 text-olive-lime" />;
      default:
        return <Eye className="w-4 h-4 text-emerald-mint" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      case 'hidden':
        return 'Hidden';
      default:
        return 'Public';
    }
  };

  return (
    <>
      <Navigation />
      <div className="bg-app space-y-8 p-4">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Poker Clubs</h1>
          <p className="text-emerald-mintSoft mt-1">
            Discover and join poker clubs in your area
          </p>
        </div>
        <Link 
          href="/clubs/new" 
          className="btn-accent rounded-xl px-6 py-3 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Club
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
          <p className="text-emerald-mintSoft">Loading clubs...</p>
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-12 card-emerald">
          <Users className="w-12 h-12 text-emerald-mint mx-auto mb-4 animate-bounce-subtle" />
          <h3 className="text-lg font-semibold mb-2 text-gradient">No clubs yet</h3>
          <p className="text-emerald-mintSoft mb-4">
            Be the first to create a poker club in your area
          </p>
          <Link
            href="/clubs/new"
            className="btn-accent rounded-xl px-6 py-3 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Club
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
          {clubs.map((club, index) => (
            <div
              key={club.id}
              className={`group p-6 rounded-2xl border transition-all duration-300 ease-soft hover:scale-[1.02] hover:-translate-y-1 ${
                index % 3 === 0 ? 'card-emerald' : 
                index % 3 === 1 ? 'card-teal' : 'card-olive'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-glow mb-1">
                    <Link href={`/clubs/${club.slug}`} className="hover:underline">
                      {club.name}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className="text-emerald-mintSoft">{club.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {getVisibilityIcon(club.visibility)}
                  <span className="text-emerald-mintSoft">{getVisibilityText(club.visibility)}</span>
                </div>
              </div>

              {club.description && (
                <p className="text-emerald-mintSoft mb-4 line-clamp-3 text-sm">
                  {club.description}
                </p>
              )}

              <Link
                href={`/clubs/${club.slug}`}
                className={`w-full text-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ease-soft ${
                  index % 3 === 0 ? 'btn-emerald' : 
                  index % 3 === 1 ? 'btn-teal' : 'btn-olive'
                }`}
              >
                View Club
              </Link>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
}


