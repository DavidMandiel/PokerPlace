"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Eye, 
  EyeOff,
  Trash2,
  Save,
  Upload
} from "lucide-react";
import Link from "next/link";
import GooglePlacesAutocomplete from "../components/GooglePlacesAutocomplete";
import { extractAddressComponents } from "../../lib/address-utils";

interface UserProfile {
  id: string;
  name: string;
  surname: string;
  nickname: string;
  email: string;
  password?: string;
  date_of_birth: string;
  avatar_url?: string;
  show_avatar: boolean;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  terms_accepted: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Local Supabase configuration
  const supabaseUrl = "http://127.0.0.1:54321";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to load existing profile directly from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new users
          console.error("Error loading profile:", profileError);
          setError("Failed to load profile");
          return;
        }

        if (profileData) {
          setProfile(profileData as UserProfile);
        } else {
          // Create default profile for new user
          const defaultProfile: UserProfile = {
            id: user.id,
            name: "",
            surname: "",
            nickname: "",
            email: user.email || "",
            date_of_birth: "",
            show_avatar: true,
            address: "",
            city: "",
            state: "",
            country: "",
            terms_accepted: false
          };
          setProfile(defaultProfile);
        }
      } else {
        router.push('/auth');
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | boolean) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const validateProfile = (profile: UserProfile): string | null => {
    if (!profile.nickname.trim()) return "Nickname is required";
    if (!profile.email.trim()) return "Email is required";
    if (!profile.password?.trim()) return "Password is required";
    if (!profile.address?.trim()) return "Address is required";
    if (!profile.city?.trim()) return "City is required";
    if (!profile.state?.trim()) return "State is required";
    if (!profile.country?.trim()) return "Country is required";
    if (!profile.terms_accepted) return "You must accept the terms and conditions";
    return null;
  };

  const handleSave = async () => {
    if (!profile) return;
    
    // Validate mandatory fields
    const validationError = validateProfile(profile);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', profile.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            name: profile.name,
            surname: profile.surname,
            nickname: profile.nickname,
            email: profile.email,
            password: profile.password,
            date_of_birth: profile.date_of_birth,
            show_avatar: profile.show_avatar,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            terms_accepted: profile.terms_accepted,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: profile.id,
            name: profile.name,
            surname: profile.surname,
            nickname: profile.nickname,
            email: profile.email,
            password: profile.password,
            date_of_birth: profile.date_of_birth,
            show_avatar: profile.show_avatar,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            terms_accepted: profile.terms_accepted
          });

        if (error) throw error;
      }
      
      setSuccess("Profile saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    if (!confirm("This will permanently delete your account and all associated data. Are you absolutely sure?")) {
      return;
    }

    setDeleting(true);
    setError(null);
    
    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      
      // Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profile?.id);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
        setError("Failed to delete profile data");
        return;
      }

      // Sign out and redirect
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      // Update profile with new avatar URL
      if (profile) {
        setProfile({ ...profile, avatar_url: previewUrl });
      }
      
      setSuccess("Avatar uploaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleAddressChange = (address: string, placeDetails?: any) => {
    if (profile) {
      // Ensure address is a string
      const addressValue = address || '';
      
      // Update the address immediately
      setProfile({ ...profile, address: addressValue });
      
      // If we have Google Places data, use it for accurate parsing
      if (placeDetails) {
        const components = extractAddressComponents(placeDetails);
        
        setProfile(prev => prev ? {
          ...prev,
          address: components.formattedAddress || addressValue,
          city: components.locality || prev.city,
          state: components.administrativeAreaLevel1 || prev.state,
          country: components.country || prev.country
        } : null);
      } else if (addressValue) {
        // Fallback to manual parsing if Google Places is not available
        const addressParts = addressValue.split(',').map(part => part.trim()).filter(part => part.length > 0);
        
        if (addressParts.length >= 2) {
          let city = '';
          let state = '';
          let country = '';
          
          // Handle different address formats
          if (addressParts.length >= 3) {
            // Format: Street, City, State, Country
            city = addressParts[addressParts.length - 3];
            state = addressParts[addressParts.length - 2];
            country = addressParts[addressParts.length - 1];
          } else if (addressParts.length === 2) {
            // Format: City, State/Country
            city = addressParts[0];
            // Check if second part looks like a state (2-3 chars) or country
            const secondPart = addressParts[1];
            if (secondPart.length <= 3 && /^[A-Z]{2,3}$/i.test(secondPart)) {
              state = secondPart;
            } else {
              country = secondPart;
            }
          }
          
          // Update profile with parsed components
          setProfile(prev => prev ? {
            ...prev,
            address,
            city: city || prev.city,
            state: state || prev.state,
            country: country || prev.country
          } : null);
        } else if (addressParts.length === 1) {
          // Single part - could be city name
          setProfile(prev => prev ? {
            ...prev,
            address,
            city: addressParts[0] || prev.city
          } : null);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="spinner-clean h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-mobile">
        {/* Header */}
        <div className="sticky-header mb-6 p-4 -mx-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Avatar Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {avatarPreview || profile.avatar_url ? (
                <img 
                  src={avatarPreview || profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
              >
                <Upload className="w-4 h-4" />
                Upload Avatar
              </label>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h2>
          
          {/* Name and Surname */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
              <input
                type="text"
                value={profile.surname || ''}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Nickname - Required */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NickName <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.nickname || ''}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email - Required */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password - Required */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={profile.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Date of Birth and Avatar Visibility */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="relative">
                <input
                  type="date"
                  value={profile.date_of_birth || ''}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <button
                    onClick={() => handleInputChange('show_avatar', !profile.show_avatar)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      profile.show_avatar ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        profile.show_avatar ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${profile.show_avatar ? 'text-green-600' : 'text-gray-400'}`}>
                    {profile.show_avatar ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Address</h2>
          
          {/* Address with Google Places Autocomplete */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <GooglePlacesAutocomplete
                value={profile.address || ''}
                onChange={handleAddressChange}
                placeholder="Start typing your address..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select from address suggestions or type manually. City, State, and Country will be automatically filled.
            </p>
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-1">
                Debug: City: "{profile.city}", State: "{profile.state}", Country: "{profile.country}"
              </div>
            )}
          </div>

          {/* Hidden fields for city, state, country (auto-filled from address) */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.city || ''}
                readOnly
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Auto-filled"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.state || ''}
                readOnly
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Auto-filled"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.country || ''}
                readOnly
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Auto-filled"
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={profile.terms_accepted}
              onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <label className="text-sm font-medium text-gray-700">
              I agree to the{" "}
              <Link 
                href="/terms" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms and Conditions
              </Link>
              <span className="text-red-500">*</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>

          {/* Delete Account Button */}
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full bg-red-600 text-white py-2.5 px-6 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
