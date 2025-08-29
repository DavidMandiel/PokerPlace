"use client";
import { useEffect, useState, use } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Building2, MapPin, Eye, EyeOff, Lock, AlertTriangle, Upload, Image } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = SupabaseUser;

type Club = {
  id: string;
  name: string;
  slug: string;
  city: string;
  visibility: "public" | "private" | "hidden";
  description?: string;
  owner_id: string;
  icon?: string;
};

export default function EditClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    description: "",
    visibility: "public" as "public" | "private" | "hidden",
    icon: ""
  });
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

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
        fetchClub(slug, user.id);
      } else {
        router.push('/auth');
      }
    };

    getUser();
  }, [supabase, slug, router]);

  const fetchClub = async (slug: string, userId: string) => {
    try {
      console.log('Fetching club with slug:', slug, 'and userId:', userId);
      
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('slug', slug)
        .eq('owner_id', userId)
        .single();

      console.log('Club fetch result:', { clubData, clubError });
      console.log('Club icon field:', clubData?.icon);

      if (clubError) {
        console.error('Error fetching club:', clubError);
        setError('Club not found or you do not have permission to edit it');
        setLoading(false);
        return;
      }

      if (!clubData) {
        setError('Club not found');
        setLoading(false);
        return;
      }

      setClub(clubData);
      setFormData({
        name: clubData.name,
        city: clubData.city,
        description: clubData.description || "",
        visibility: clubData.visibility,
        icon: clubData.icon || ""
      });
      setIconPreview(clubData.icon || null);
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
      // Generate new slug if name changed
      const newSlug = formData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Prepare update data
      const updateData = {
        name: formData.name,
        slug: newSlug,
        city: formData.city,
        description: formData.description || null,
        visibility: formData.visibility,
        updated_at: new Date().toISOString()
      };

      // Add icon if available
      if (formData.icon) {
        (updateData as any).icon = formData.icon;
      }

      console.log('Updating club with data:', updateData);

      const { data: updateResult, error: updateError } = await supabase
        .from('clubs')
        .update(updateData)
        .eq('id', club.id)
        .select();

      if (updateError) {
        console.error('Error updating club:', updateError);
        console.error('Error details:', updateError.message, updateError.details, updateError.hint);
        setError(`Failed to update club: ${updateError.message}`);
        return;
      }

      console.log('Club updated successfully:', updateResult);
      console.log('Icon data that was saved:', formData.icon);

      // Redirect to the updated club page
      router.push(`/clubs/${newSlug}`);
    } catch (error) {
      console.error('Error updating club:', error);
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

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !club) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    setUploadingIcon(true);

    try {
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to data URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      setFormData(prev => ({
        ...prev,
        icon: dataUrl
      }));

      console.log('Icon uploaded successfully, data URL length:', dataUrl.length);

    } catch (error) {
      console.error('Error uploading icon:', error);
      alert('Failed to upload icon. Please try again.');
      setIconPreview(null);
    } finally {
      setUploadingIcon(false);
    }
  };

  const removeIcon = () => {
    setFormData(prev => ({
      ...prev,
      icon: ""
    }));
    setIconPreview(null);
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
            <h1 className="text-3xl font-bold text-gradient">Edit Club</h1>
            <p className="text-emerald-mintSoft">Update your club information</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-emerald p-6">
            {/* Club Icon */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Club Icon
              </label>
              <div className="flex items-center gap-4">
                {/* Current Icon Display */}
                <div className="w-16 h-16 rounded-xl border-2 border-emerald-mint/30 flex items-center justify-center bg-emerald-dark/50">
                  {iconPreview ? (
                    <img 
                      src={iconPreview} 
                      alt="Club icon" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : formData.icon ? (
                    <img 
                      src={formData.icon} 
                      alt="Club icon" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-emerald-mint">
                      {club?.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* Upload Controls */}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                      disabled={uploadingIcon}
                    />
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-dark/50 border border-emerald-mint/30 rounded-lg hover:bg-emerald-dark transition-colors disabled:opacity-60">
                      {uploadingIcon ? (
                        <div className="spinner-modern h-4 w-4"></div>
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {uploadingIcon ? 'Uploading...' : 'Upload Icon'}
                      </span>
                    </div>
                  </label>
                  
                  {(iconPreview || formData.icon) && (
                    <button
                      type="button"
                      onClick={removeIcon}
                      className="flex items-center gap-2 px-3 py-2 bg-brand-red/20 border border-brand-red/30 rounded-lg hover:bg-brand-red/30 transition-colors text-brand-red text-sm"
                    >
                      Remove Icon
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-emerald-mintSoft mt-2">
                Upload a square image (max 2MB). Recommended size: 256x256px. 
                <br />
                <span className="text-yellow-400">Note: Icons are stored as data URLs for now. Storage bucket setup coming soon!</span>
              </p>
            </div>

            {/* Club Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Club Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl text-glow placeholder-emerald-mintSoft focus:outline-none focus:border-emerald-mint transition-colors"
                placeholder="Enter club name"
                required
              />
            </div>

            {/* City */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl text-glow placeholder-emerald-mintSoft focus:outline-none focus:border-emerald-mint transition-colors"
                placeholder="Enter city"
                required
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
                placeholder="Describe your club..."
              />
            </div>

            {/* Visibility */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                {formData.visibility === 'public' ? (
                  <Eye className="w-4 h-4" />
                ) : formData.visibility === 'private' ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => handleInputChange('visibility', e.target.value)}
                className="w-full px-4 py-3 bg-emerald-dark/50 border border-emerald-mint/30 rounded-xl text-glow focus:outline-none focus:border-emerald-mint transition-colors"
              >
                <option value="public">Public - Anyone can find and join</option>
                <option value="private">Private - Invitation only</option>
                <option value="hidden">Hidden - Only members can see</option>
              </select>
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
                  Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
