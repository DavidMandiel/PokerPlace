"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { slugify } from "../../../lib/slug";
import { ArrowLeft, MapPin, Users, Eye, EyeOff, Building2, Calendar, X, HelpCircle, Pencil, Image } from "lucide-react";
import Link from "next/link";
import GooglePlacesAutocomplete from "../../components/GooglePlacesAutocomplete";

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
  const [location, setLocation] = useState("");
  const [roles, setRoles] = useState("");

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Club</h1>
        <p className="text-gray-600 text-base">Set up your poker club to organize events and manage members</p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Club's Logo Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Club's Logo</h2>
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
                className="w-32 h-32 rounded-full border-2 border-dashed border-emerald-300 bg-emerald-50 flex items-center justify-center cursor-pointer hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
              >
                {icon ? (
                  <img 
                    src={icon} 
                    alt="Club logo" 
                    className="w-28 h-28 object-cover rounded-full"
                  />
                ) : (
                  <div className="text-center">
                    <Image className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <span className="text-emerald-600 text-sm font-medium">Upload Logo</span>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Club Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Club Information</h2>
          <div className="space-y-6">
            {/* Club Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club Name *
              </label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="Vegas High Rollers" 
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors" 
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <GooglePlacesAutocomplete
                value={location}
                onChange={(address) => setLocation(address)}
                placeholder="123 William Street, New York, NY"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="A friendly poker club for players of all levels..." 
                rows={3}
                maxLength={200}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none transition-colors" 
              />
              <p className="text-xs text-gray-500 mt-2 text-right">
                {description.length}/200
              </p>
            </div>

            {/* Club Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club Type *
              </label>
              <select 
                value={visibility} 
                onChange={(e) => setVisibility(e.target.value as any)} 
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none text-sm transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1em 1em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="public" className="bg-white text-gray-900">Public - Anyone can join</option>
                <option value="private" className="bg-white text-gray-900">Private - Only invited members</option>
                <option value="hidden" className="bg-white text-gray-900">Hidden - Not visible in searches</option>
              </select>
            </div>
          </div>
        </div>

        {/* Club's Roles Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Club's Roles</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roles & Responsibilities
            </label>
            <textarea 
              value={roles} 
              onChange={(e) => setRoles(e.target.value)} 
              placeholder="Describe the roles and responsibilities within your club..." 
              rows={4}
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none transition-colors" 
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {roles.length}/200
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Save & Publish Button */}
        <div className="flex gap-4 pt-4">
          <button 
            type="submit"
            disabled={submitting || !name.trim() || !location.trim() || !description.trim()} 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 h-12 shadow-sm"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
                Save & Publish
              </>
            )}
          </button>
          <Link 
            href="/dashboard"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center h-12 shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => setShowHelpPopup(true)}
            className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center h-12 shadow-sm"
            title="What happens next?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Help Popup */}
      {showHelpPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                What happens next?
              </h3>
              <button
                onClick={() => setShowHelpPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Your club will be created and you'll be set as the owner</li>
              <li>• You can start inviting members and organizing events</li>
              <li>• You'll have full control over club settings and membership</li>
              <li>• You can customize your club's appearance and rules</li>
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpPopup(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
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


