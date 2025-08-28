"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { slugify } from "../../../lib/slug";
import { ArrowLeft, MapPin, Users, Eye, EyeOff, Building2, Calendar, X, HelpCircle, Pencil, Image } from "lucide-react";
import Link from "next/link";

export default function NewClubPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "hidden">("public");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showHelpPopup, setShowHelpPopup] = useState(false);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 1MB for icons)
    if (file.size > 1024 * 1024) {
      setError("Icon file size must be less than 1MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file");
      return;
    }

    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setIcon(result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError("Error processing image. Please try again.");
    }
  };

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
    };
    getUser();
  }, [supabase, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!user) {
      setError("You must be logged in to create a club");
      setSubmitting(false);
      return;
    }

    try {
      const slug = slugify(name);
      
      // Check if slug already exists
      const { data: existingClub } = await supabase
        .from("clubs")
        .select("id")
        .eq("slug", slug)
        .single();

      if (existingClub) {
        setError("A club with this name already exists. Please choose a different name.");
        setSubmitting(false);
        return;
      }

      // Create the club
      // TODO: Add 'icon' column to clubs table in Supabase
      const { data: club, error: clubError } = await supabase
        .from("clubs")
        .insert({ 
          name, 
          city, 
          description: description.trim() || null,
          visibility, 
          slug,
          owner_id: user.id
        })
        .select()
        .single();

      if (clubError) {
        setError(clubError.message);
        setSubmitting(false);
        return;
      }

      // Add the creator as a member
      try {
        const { error: memberError } = await supabase
          .from("club_members")
          .insert({
            club_id: club.id,
            user_id: user.id,
            role: "owner"
          });

        if (memberError) {
          console.error("Error adding user as member:", memberError.message);
          // Don't fail the club creation if member creation fails
        }
      } catch (memberErr) {
        console.error("Error adding user as member:", memberErr);
        // Don't fail the club creation if member creation fails
      }

      // Show success and redirect to the dashboard
      console.log("Club created successfully:", club);
      router.push('/dashboard');
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error creating club:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const getVisibilityIcon = () => {
    switch (visibility) {
      case "public":
        return <Eye className="w-4 h-4" />;
      case "private":
        return <EyeOff className="w-4 h-4" />;
      case "hidden":
        return <EyeOff className="w-4 h-4" />;
    }
  };

  const getVisibilityDescription = () => {
    switch (visibility) {
      case "public":
        return "Anyone can find and join your club";
      case "private":
        return "Only invited members can join your club";
      case "hidden":
        return "Your club is hidden from searches";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-mint"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-lg font-bold text-gradient mb-1">Create a New Club</h1>
        <p className="text-emerald-mint/60 text-xs">Set up your poker club to organize events and manage members</p>
      </div>

      {/* Form */}
      <div className="card-emerald p-3.5">
        <form onSubmit={onSubmit} className="space-y-3.5">
          {/* Club Name and Icon */}
          <div className="flex gap-3">
            {/* Club Name */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-emerald-mint mb-1">
                <Building2 className="w-3 h-3 inline mr-1" />
                Club Name *
              </label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="e.g., Downtown Poker Club" 
                className="w-full rounded-lg border border-emerald/20 bg-emerald/10 px-2 py-1 text-white placeholder-emerald-mint/50 focus:outline-none focus:ring-1 focus:ring-emerald-mint/20 focus:border-emerald-mint/30 text-sm" 
              />
              <p className="text-xs text-emerald-mint/60 mt-1">
                URL: pokerplace.com/clubs/{slugify(name || "your-club-name")}
              </p>
            </div>

            {/* Club Icon */}
            <div className="w-24">
              <label className="block text-xs font-medium text-emerald-mint mb-1">
                <Image className="w-3 h-3 inline mr-1" />
                Icon
              </label>
              <div className="relative">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleIconUpload(e)}
                  className="hidden"
                  id="icon-upload"
                />
                <label 
                  htmlFor="icon-upload"
                  className="w-full h-8 rounded-lg border border-emerald/20 bg-emerald/10 flex items-center justify-center cursor-pointer hover:bg-emerald/20 transition-colors"
                >
                  {icon ? (
                    <img 
                      src={icon} 
                      alt="Club icon" 
                      className="w-6 h-6 object-cover rounded"
                    />
                  ) : (
                    <Image className="w-4 h-4 text-emerald-mint/50" />
                  )}
                </label>
              </div>
              <p className="text-xs text-emerald-mint/60 mt-1">
                Upload icon
              </p>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-emerald-mint mb-1">
              <MapPin className="w-3 h-3 inline mr-1" />
              City *
            </label>
            <input 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              required 
              placeholder="e.g., Tel Aviv" 
              className="w-full rounded-lg border border-emerald/20 bg-emerald/10 px-2 py-1 text-white placeholder-emerald-mint/50 focus:outline-none focus:ring-1 focus:ring-emerald-mint/20 focus:border-emerald-mint/30 text-sm" 
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-emerald-mint mb-1">
              Description
            </label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Tell people about your club, what games you play, skill levels, etc." 
              rows={2}
              className="w-full rounded-lg border border-emerald/20 bg-emerald/10 px-2 py-1 text-white placeholder-emerald-mint/50 focus:outline-none focus:ring-1 focus:ring-emerald-mint/20 focus:border-emerald-mint/30 resize-none text-sm" 
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs font-medium text-emerald-mint mb-1">
              {getVisibilityIcon()} Visibility *
            </label>
            <select 
              value={visibility} 
              onChange={(e) => setVisibility(e.target.value as any)} 
              className="w-full rounded-lg border border-emerald/20 bg-emerald/10 px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-emerald-mint/20 focus:border-emerald-mint/30 appearance-none text-sm"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234fd1a1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1em 1em',
                paddingRight: '2rem'
              }}
            >
              <option value="public" className="bg-emerald-dark text-white">Public - Anyone can find and join</option>
              <option value="private" className="bg-emerald-dark text-white">Private - Only invited members</option>
              <option value="hidden" className="bg-emerald-dark text-white">Hidden - Not visible in searches</option>
            </select>
            <p className="text-xs text-emerald-mint/60 mt-1">
              {getVisibilityDescription()}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2 mt-4 items-center">
            <button 
              type="submit"
              disabled={submitting || !name.trim() || !city.trim()} 
              className="flex-1 bg-emerald hover:bg-emerald-dark text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 h-8"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Pencil className="w-3 h-3" />
                  Create Club
                </>
              )}
            </button>
            <Link 
              href="/dashboard"
              className="border border-emerald-mint/30 text-emerald-mint px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-mint/10 transition-colors flex items-center justify-center h-8"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => setShowHelpPopup(true)}
              className="border border-emerald-mint/30 text-emerald-mint px-2 py-2 rounded-lg text-sm font-medium hover:bg-emerald-mint/10 transition-colors flex items-center justify-center h-8 w-8"
              title="What happens next?"
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>

      {/* Help Popup */}
      {showHelpPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-teal p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-glow flex items-center gap-2">
                <Users className="w-5 h-5" />
                What happens next?
              </h3>
              <button
                onClick={() => setShowHelpPopup(false)}
                className="text-emerald-mint/60 hover:text-emerald-mint"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-2 text-teal-soft text-sm">
              <li>• Your club will be created and you'll be set as the owner</li>
              <li>• You can start inviting members and organizing events</li>
              <li>• You'll have full control over club settings and membership</li>
              <li>• You can customize your club's appearance and rules</li>
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowHelpPopup(false)}
                className="btn-modern"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


