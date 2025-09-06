"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, User, Calendar, Filter, CalendarDays } from "lucide-react";
import Navigation from "../components/Navigation";
import GooglePlacesAutocomplete from "../components/GooglePlacesAutocomplete";

type EventType = "tournament" | "cash" | "all";
type GameType = "TNLH" | "PLO" | "7CS" | "Mixed" | "all";
type SearchMode = "club" | "event";

interface SearchFilters {
  searchMode: SearchMode;
  clubName: string;
  hostName: string;
  location: string;
  eventType: EventType;
  gameType: GameType;
  startDate: string;
  endDate: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>({
    searchMode: "club",
    clubName: "",
    hostName: "",
    location: "",
    eventType: "all",
    gameType: "all",
    startDate: "",
    endDate: ""
  });

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (location: string, placeDetails?: any) => {
    setFilters(prev => ({
      ...prev,
      location: location
    }));
  };

  const handleSearch = () => {
    // Build search parameters
    const searchParams = new URLSearchParams();
    
    // Add all non-empty filters to URL parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        searchParams.set(key, value.toString());
      }
    });

    // Navigate to results page with search parameters
    router.push(`/search/results?${searchParams.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      searchMode: "club",
      clubName: "",
      hostName: "",
      location: "",
      eventType: "all",
      gameType: "all",
      startDate: "",
      endDate: ""
    });
  };

  return (
    <>
      <Navigation showBackButton={true} backHref="/clubs" />
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Search & Filter</h1>
            <button 
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Search Mode Toggle */}
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
              <button
                onClick={() => handleInputChange("searchMode", "club")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  filters.searchMode === "club"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Search Clubs
              </button>
              <button
                onClick={() => handleInputChange("searchMode", "event")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  filters.searchMode === "event"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Search Events
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Name Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  {filters.searchMode === "club" ? "Club Name" : "Event Name"}
                </div>
              </label>
              <input
                type="text"
                value={filters.clubName}
                onChange={(e) => handleInputChange("clubName", e.target.value)}
                placeholder={filters.searchMode === "club" ? "Search by club name..." : "Search by event name..."}
                className="input-clean"
              />
            </div>

            {/* Host/Organizer Name Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {filters.searchMode === "club" ? "Host Name" : "Organizer Name"}
                </div>
              </label>
              <input
                type="text"
                value={filters.hostName}
                onChange={(e) => handleInputChange("hostName", e.target.value)}
                placeholder={filters.searchMode === "club" ? "Search by host name..." : "Search by organizer name..."}
                className="input-clean"
              />
            </div>

            {/* Location Search with Google Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
              </label>
              <GooglePlacesAutocomplete
                onChange={handleLocationSelect}
                placeholder="Search by city or country..."
                value={filters.location}
                className="input-clean"
              />
            </div>

            {/* Event Type Filter - Only show for Event mode */}
            {filters.searchMode === "event" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Event Type
                  </div>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="all"
                      checked={filters.eventType === "all"}
                      onChange={(e) => handleInputChange("eventType", e.target.value as EventType)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">All</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="tournament"
                      checked={filters.eventType === "tournament"}
                      onChange={(e) => handleInputChange("eventType", e.target.value as EventType)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Tournament</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="cash"
                      checked={filters.eventType === "cash"}
                      onChange={(e) => handleInputChange("eventType", e.target.value as EventType)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Cash</span>
                  </label>
                </div>
              </div>
            )}

            {/* Game Type Filter - Only show for Event mode */}
            {filters.searchMode === "event" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Game Type
                  </div>
                </label>
                <select
                  value={filters.gameType}
                  onChange={(e) => handleInputChange("gameType", e.target.value as GameType)}
                  className="input-clean"
                >
                  <option value="all">All Game Types</option>
                  <option value="TNLH">TNLH (Texas No Limit Hold'em)</option>
                  <option value="PLO">PLO (Pot Limit Omaha)</option>
                  <option value="7CS">7CS (7 Card Stud)</option>
                  <option value="Mixed">Mixed Games</option>
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  {filters.searchMode === "club" ? "Club Creation Date Range" : "Event Date Range"}
                </div>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="input-clean"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="input-clean"
                    min={filters.startDate || undefined}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to search all dates
              </p>
            </div>

            {/* Search Button */}
            <div className="pt-6">
              <button
                onClick={handleSearch}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

            {/* Current Filters Display */}
            {(filters.clubName || filters.hostName || filters.location || filters.eventType !== "all" || filters.gameType !== "all" || filters.startDate || filters.endDate) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h3>
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
          </div>
        </div>
      </div>
    </>
  );
}
