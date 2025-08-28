"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Calendar, MapPin, Users, Clock, Building2, AlertTriangle } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = SupabaseUser;

type Club = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
};

export default function NewEventPage({ params }: { params: { slug: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    max_participants: "",
    event_type: "tournament" as "tournament" | "cash_game" | "sit_and_go"
  });

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchClub(params.slug, user.id);
      } else {
        router.push('/auth');
      }
    };

    getUser();
  }, [supabase, params.slug, router]);

  const fetchClub = async (slug: string, userId: string) => {
    try {
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('slug', slug)
        .eq('owner_id', userId)
        .single();

      if (clubError) {
        console.error('Error fetching club:', clubError);
        setError('Club not found or you do not have permission to create events');
        setLoading(false);
        return;
      }

      if (!clubData) {
        setError('Club not found');
        setLoading(false);
        return;
      }

      setClub(clubData);
    } catch (error) {
      console.error('Error fetching club:', error);
      setError('Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club || !user) return;

    setSaving(true);
    setError(null);

    try {
      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

      const { error: insertError } = await supabase
        .from('events')
        .insert({
          club_id: club.id,
          title: formData.title,
          description: formData.description || null,
          event_date: eventDateTime,
          location: formData.location,
          max_participants: parseInt(formData.max_participants) || null,
          event_type: formData.event_type,
          created_by: user.id
        });

      if (insertError) {
        console.error('Error creating event:', insertError);
        setError('Failed to create event. Please try again.');
        return;
      }

      // Redirect to the club's events page
      router.push(`/clubs/${club.slug}/events`);
    } catch (error) {
      console.error('Error creating event:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="bg-app flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
          <p className="text-emerald-mintSoft">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-app flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-brand-red mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gradient">Error</h2>
          <p className="text-emerald-mintSoft mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="btn-accent rounded-xl px-6 py-2"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!club) {
    return null;
  }

  return (
    <div className="bg-app min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/clubs/${club.slug}`}
            className="p-2 rounded-xl hover:bg-emerald-dark transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Create New Event</h1>
            <p className="text-emerald-mintSoft">Add an event to {club.name}</p>
          </div>
        </div>

        {/* Event Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-emerald p-6">
            {/* Event Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Event Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl text-glow placeholder-emerald-mintSoft focus:outline-none focus:border-emerald-mint transition-colors"
                placeholder="Enter event title"
                required
              />
            </div>

            {/* Event Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Event Type
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => handleInputChange('event_type', e.target.value)}
                className="w-full px-4 py-3 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl text-glow focus:outline-none focus:border-emerald-mint transition-colors"
              >
                <option value="tournament">Tournament</option>
                <option value="cash_game">Cash Game</option>
                <option value="sit_and_go">Sit & Go</option>
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-3 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl text-glow focus:outline-none focus:border-emerald-mint transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-4 py-3 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl text-glow focus:outline-none focus:border-emerald-mint transition-colors"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl text-glow placeholder-emerald-mintSoft focus:outline-none focus:border-emerald-mint transition-colors"
                placeholder="Enter event location"
                required
              />
            </div>

            {/* Max Participants */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Max Participants
              </label>
              <input
                type="number"
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', e.target.value)}
                className="w-full px-4 py-3 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl text-glow placeholder-emerald-mintSoft focus:outline-none focus:border-emerald-mint transition-colors"
                placeholder="Enter max participants (optional)"
                min="1"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl text-glow placeholder-emerald-mintSoft focus:outline-none focus:border-emerald-mint transition-colors resize-none"
                placeholder="Describe the event..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href={`/clubs/${club.slug}`}
              className="flex-1 text-center btn-outline-modern rounded-xl py-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-accent rounded-xl py-3 disabled:opacity-60"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner-modern h-4 w-4"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Create Event
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
