"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { slugify } from "../../../../lib/slug";
import { ArrowLeft, MapPin, Users, Eye, EyeOff, Building2, Calendar, X, HelpCircle, Pencil, Image } from "lucide-react";
import Link from "next/link";
import GooglePlacesAutocomplete from "../../../components/GooglePlacesAutocomplete";
import Navigation from "../../../components/Navigation";

export default function EditClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "hidden">("public");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [location, setLocation] = useState("");
  const [roles, setRoles] = useState("");
  const [loading, setLoading] = useState(true);

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
      console.log('Slug from params:', slug);
      fetchClub(slug, user.id);
    };
    getUser();
  }, [supabase, slug, router]);

  const fetchClub = async (slug: string, userId: string) => {
    try {
      setLoading(true);
      
      // Decode the slug from URL and clean it
      const cleanSlug = decodeURIComponent(slug).trim();
      console.log('Fetching club with slug:', cleanSlug, 'for user:', userId);
      
      // First try to fetch the club by slug only to see if it exists
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('slug', cleanSlug)
        .single();

      if (clubError) {
        console.error('Error fetching club:', clubError);
        console.error('Club error details:', {
          message: clubError.message,
          details: clubError.details,
          hint: clubError.hint,
          code: clubError.code
        });
        setError(`Club not found or you do not have permission to edit it. Error: ${clubError.message}`);
        setLoading(false);
        return;
      }

      if (!clubData) {
        setError('Club not found');
        setLoading(false);
        return;
      }

      // Check if the user owns this club
      if (clubData.owner_id !== userId) {
        setError('You do not have permission to edit this club');
        setLoading(false);
        return;
      }

      // Populate form with existing club data
      setName(clubData.name || "");
      setIcon(clubData.icon || "");
      setCity(clubData.city || "");
      setStreet(clubData.street || "");
      setStreetNumber(clubData.street_number || "");
      setState(clubData.state || "");
      setCountry(clubData.country || "");
      setPostalCode(clubData.postal_code || "");
      setDescription(clubData.description || "");
      setVisibility(clubData.visibility || "public");
      setRoles(clubData.roles || "");
      setLocation(clubData.city || ""); // Use city as location fallback
      
    } catch (error) {
      console.error('Error fetching club:', error);
      setError('Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file");
      return;
    }

    try {
      let processedFile = file;
      
      // If file is larger than 1MB, resize it
      if (file.size > 1024 * 1024) {
        console.log(`Resizing image from ${file.size} bytes to max 800x800`);
        processedFile = await resizeImage(file, 800, 800); // Resize to max 800x800
        console.log(`Image resized successfully to ${processedFile.size} bytes`);
      }

      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setIcon(result);
        console.log('Image converted to base64 successfully');
      };
      reader.onerror = () => {
        setError("Failed to read image file. Please try again.");
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Image processing error:', error);
      setError(`Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        const img = new Image();
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.onload = () => {
          try {
            // Calculate new dimensions maintaining aspect ratio
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw resized image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob
            canvas.toBlob((blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            }, file.type, 0.8); // 0.8 quality for good compression
          } catch (error) {
            reject(new Error(`Error processing image: ${error}`));
          }
        };
        
        img.src = URL.createObjectURL(file);
      } catch (error) {
        reject(new Error(`Error setting up image processing: ${error}`));
      }
    });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!user) {
      setError("You must be logged in to edit a club");
      setSaving(false);
      return;
    }

    if (!name.trim() || !city.trim() || !country.trim() || !description.trim()) {
      setError("Please fill in all required fields (Club Name, City, Country, and Description)");
      setSaving(false);
      return;
    }

    try {
      // Update the club
      const { data: club, error: clubError } = await supabase
        .from("clubs")
        .update({ 
          name, 
          city: city.trim() || location.trim(), 
          street: street.trim() || null,
          street_number: streetNumber.trim() || null,
          state: state.trim() || null,
          country: country.trim() || null,
          postal_code: postalCode.trim() || null,
          description: description.trim() || null,
          roles: roles.trim() || null,
          icon: icon || null,
          visibility,
          updated_at: new Date().toISOString()
        })
        .eq('slug', slug)
        .eq('owner_id', user.id)
        .select()
        .single();

      if (clubError) {
        setError(clubError.message);
        setSaving(false);
        return;
      }

      // Show success and redirect to the club page
      console.log("Club updated successfully:", club);
      router.push(`/clubs/${slug}`);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error updating club:", err);
    } finally {
      setSaving(false);
    }
  }

  const parseAddress = (address: string) => {
    if (!address) return;
    
    // Split the address into components
    const parts = address.split(',').map(part => part.trim());
    
    // Try to extract street number and street name from the first part
    if (parts.length > 0) {
      const firstPart = parts[0];
      // Check if it starts with a number
      const numberMatch = firstPart.match(/^(\d+)\s+(.+)/);
      if (numberMatch) {
        setStreetNumber(numberMatch[1]);
        setStreet(numberMatch[2]);
      } else {
        setStreet(firstPart);
        setStreetNumber('');
      }
    }
    
    // Extract city (usually second to last part)
    if (parts.length > 1) {
      const cityPart = parts[parts.length - 2];
      if (cityPart && !cityPart.match(/^\d{5}/)) { // Not a ZIP code
        setCity(cityPart);
      }
    }
    
    // Extract state (usually third to last part)
    if (parts.length > 2) {
      const statePart = parts[parts.length - 3];
      if (statePart && statePart.length <= 2) { // Likely a state abbreviation
        setState(statePart);
      }
    }
    
    // Extract country (usually last part)
    if (parts.length > 0) {
      const countryPart = parts[parts.length - 1];
      if (countryPart) {
        setCountry(countryPart);
      }
    }
    
    // Extract postal code (look for 5-digit numbers)
    const zipMatch = address.match(/\b\d{5}\b/);
    if (zipMatch) {
      setPostalCode(zipMatch[0]);
    }
  };

  const getVisibilityDescription = (visibility: "public" | "private" | "hidden") => {
    switch (visibility) {
      case "public":
        return "Anyone can find and join your club";
      case "private":
        return "Only invited members can join your club";
      case "hidden":
        return "Your club is hidden from searches";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation showBackButton={true} backHref={`/clubs/${slug}`} />
      <div className="w-full flex flex-col px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-emerald-600 mb-3">Edit Club</h1>
          <p className="text-emerald-700/80 text-lg">Update your poker community</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4 max-w-4xl">
          {/* Club's Logo Section */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm border border-emerald-200">
            <div className="relative w-full">
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => handleIconUpload(e)}
                className="hidden"
                id="icon-upload"
              />
              <label 
                htmlFor="icon-upload"
                className="w-full h-32 rounded-xl border-2 border-dashed border-emerald-400 bg-white flex items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-500 transition-colors shadow-sm relative overflow-hidden"
              >
                {icon ? (
                  <div className="w-full h-full relative group">
                    <img 
                      src={icon} 
                      alt="Club logo" 
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: 'center center',
                        objectFit: 'cover'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-center text-white">
                        <Image className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Change Logo</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Image className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span className="text-emerald-600 text-sm font-medium">Upload Logo</span>
                    <p className="text-emerald-500/70 text-xs mt-1">Click to upload club logo</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Club Information Section */}
          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-sm border border-emerald-200 p-4">
            <h2 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Club Information
            </h2>
            <div className="space-y-3">
              {/* Club Name */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  Club Name *
                </label>
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="Vegas High Rollers" 
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors" 
                />
                <p className="text-xs text-emerald-600/70 mt-1">Club Name is mandatory</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  Location *
                </label>
                <GooglePlacesAutocomplete
                  value={location} 
                  onChange={(address) => {
                    setLocation(address);
                    // Parse the address and update individual fields
                    parseAddress(address);
                  }} 
                  placeholder="123 William Street, New York, NY" 
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors" 
                  required
                />
                <p className="text-xs text-emerald-600/70 mt-1">Location is mandatory. For private clubs, non-members will only see city and country.</p>
              </div>

                          {/* Detailed Location Fields */}
            <div className="grid grid-cols-2 gap-3">
              {/* Street Number */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  Street Number
                </label>
                <input 
                  value={streetNumber} 
                  onChange={(e) => setStreetNumber(e.target.value)} 
                  placeholder="123" 
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors" 
                />
              </div>

              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  Street Name
                </label>
                <input 
                  value={street} 
                  onChange={(e) => setStreet(e.target.value)} 
                  placeholder="William Street" 
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors" 
                />
              </div>
            </div>
                        <div className="grid grid-cols-3 gap-3">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  City *
                </label>
                <input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  required 
                  placeholder="New York" 
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors" 
                />
              </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    State/Province
                  </label>
                  <input 
                    value={state} 
                    onChange={(e) => setState(e.target.value)} 
                    placeholder="NY" 
                    className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors" 
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Postal Code
                  </label>
                  <input 
                    value={postalCode} 
                    onChange={(e) => setPostalCode(e.target.value)} 
                    placeholder="10001" 
                    className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors" 
                  />
                </div>
              </div>
              <p className="text-xs text-emerald-600/70 mt-1">City is mandatory</p>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  Country *
                </label>
                <input 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  required 
                  placeholder="United States" 
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors" 
                />
                <p className="text-xs text-emerald-600/70 mt-1">Country is mandatory</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  Description *
                </label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="A friendly poker club for players of all levels..." 
                  rows={3}
                  maxLength={200}
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none transition-colors" 
                />
                <p className="text-xs text-emerald-600/70 mt-1 text-right">
                  {description.length}/200
                </p>
              </div>

              {/* Club Type */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  Privacy Level *
                </label>
                <select 
                  value={visibility} 
                  onChange={(e) => setVisibility(e.target.value as any)} 
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none text-sm transition-colors"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1em 1em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="public" className="bg-white text-gray-900">Public - Anyone can find and join</option>
                  <option value="private" className="bg-white text-gray-900">Private - Only invited members</option>
                  <option value="hidden" className="bg-white text-gray-900">Hidden - Not visible in searches</option>
                </select>
                <p className="text-xs text-emerald-600/70 mt-1">Privacy Level is mandatory.</p>
                
              </div>
            </div>
          </div>

          {/* Club's Roles Section */}
          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-sm border border-emerald-200 p-4">
            <h2 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Roles & Responsibilities
            </h2>
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Roles & Responsibilities
              </label>
              <textarea 
                value={roles} 
                onChange={(e) => setRoles(e.target.value)} 
                placeholder="Describe the roles and responsibilities within your club..." 
                rows={4}
                maxLength={200}
                className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-900 placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none transition-colors" 
              />
              <p className="text-xs text-emerald-600/70 mt-1 text-right">
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

          {/* Save Changes Button */}
          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              disabled={saving || !name.trim() || !city.trim() || !country.trim() || !description.trim()} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 h-12 shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <Link 
              href="/clubs/managed"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center h-12 shadow-sm"
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
        
        {/* Bottom Spacing */}
        <div className="pb-8"></div>

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
                <li>• Your club will be updated with the new information</li>
                <li>• All changes will be immediately visible to members</li>
                <li>• You can continue managing your club and organizing events</li>
                <li>• Members will be notified of any significant changes</li>
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
    </>
  );
}
