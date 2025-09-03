"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { slugify } from "../../../lib/slug";
import { ArrowLeft, MapPin, Users, Eye, EyeOff, Building2, Calendar, X, HelpCircle, Pencil, Image } from "lucide-react";
import Link from "next/link";
import GooglePlacesAutocomplete from "../../components/GooglePlacesAutocomplete";
import Navigation from "../../components/Navigation";

export default function NewClubPage() {
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [location, setLocation] = useState("");
  const [roles, setRoles] = useState("");

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

    if (!name.trim() || !city.trim() || !country.trim() || !description.trim()) {
      setError("Please fill in all required fields (Club Name, City, Country, and Description)");
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
      const { data: club, error: clubError } = await supabase
        .from("clubs")
        .insert({ 
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

      // Show success and redirect to managed clubs page
      console.log("Club created successfully:", club);
      router.push('/clubs/managed');
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
    <>
      <Navigation />
      <div className="w-full flex flex-col px-6">
        {/* Header */}
        <div className="mb-6 pt-6">
          <h1 className="text-4xl font-bold text-emerald-600 mb-3">Create new Club</h1>
          <p className="text-emerald-700/80 text-lg">Set up new poker community</p>
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
              <p className="text-xs text-emerald-600/70 mt-1">This field is mandatory</p>
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
              <p className="text-xs text-emerald-600/70 mt-1">This field is mandatory. For private clubs, non-members will only see city and country.</p>
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
              <p className="text-xs text-emerald-600/70 mt-1">City field is mandatory</p>

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
              <p className="text-xs text-emerald-600/70 mt-1">This field is mandatory</p>
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
                <option value="public" className="bg-white text-gray-900">Public - Anyone can join</option>
                <option value="private" className="bg-white text-gray-900">Private - Only invited members</option>
                <option value="hidden" className="bg-white text-gray-900">Hidden - Not visible in searches</option>
              </select>
              <p className="text-xs text-emerald-600/70 mt-1">This field is mandatory.</p>
            </div>
          </div>
          
        </div>

        {/* Club's Roles Section */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-sm border border-emerald-200 p-4">
          <h2 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Club's Roles
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

        {/* Save & Publish Button */}
        <div className="flex gap-4 pt-4">
                        <button 
                type="submit"
                disabled={submitting || !name.trim() || !city.trim() || !country.trim() || !description.trim()} 
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
    </>
  );
}


