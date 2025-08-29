"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Calendar, Plus, Minus } from "lucide-react";

type EventType = "tournament" | "cash";
type GameType = "TNLH" | "PLO" | "7CS" | "Mixed";

export default function CreateEventPage() {
  const router = useRouter();
  const [eventType, setEventType] = useState<EventType>("tournament");
  const [gameType, setGameType] = useState<GameType>("TNLH");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    buyin: 100,
    numberOfTables: 1,
    playersPerTable: 9,
    startingStack: 30000,
    startingBlinds: 100,
    timePerLevel: 20,
    blinds: "1/2",
    remarks: ""
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success state for 3 seconds then redirect
    // In a real app, you'd save to database here
    
    // Simulate success
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-app p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-mintSoft hover:text-emerald-mint transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-xl font-semibold text-glow">Create New Event</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Event Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
              Event Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Sunday Omaha Cash"
              className="w-full bg-white/5 border border-emerald-mint/20 rounded-lg px-4 py-3 text-emerald-mintSoft placeholder-emerald-mintSoft/50 focus:outline-none focus:border-emerald-mint/40"
              required
            />
          </div>

          {/* Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
              Picture
            </label>
            <div className="w-24 h-24 bg-white/5 border border-emerald-mint/20 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
              <Camera className="w-8 h-8 text-emerald-mintSoft" />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-mintSoft" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full bg-white/5 border border-emerald-mint/20 rounded-lg pl-10 pr-4 py-3 text-emerald-mintSoft focus:outline-none focus:border-emerald-mint/40"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="w-full bg-white/5 border border-emerald-mint/20 rounded-lg px-4 py-3 text-emerald-mintSoft focus:outline-none focus:border-emerald-mint/40"
                required
              />
            </div>
          </div>
        </div>

        {/* Event Type Selection */}
        <div>
          <label className="block text-sm font-medium text-emerald-mintSoft mb-3">
            Event Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="eventType"
                value="tournament"
                checked={eventType === "tournament"}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="text-emerald-mint"
              />
              <span className="text-emerald-mintSoft">Tournament</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="eventType"
                value="cash"
                checked={eventType === "cash"}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="text-emerald-mint"
              />
              <span className="text-emerald-mintSoft">Cash</span>
            </label>
          </div>
        </div>

        {/* Game Type */}
        <div>
          <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
            Game Type
          </label>
          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value as GameType)}
            className="w-full bg-white/5 border border-emerald-mint/20 rounded-lg px-4 py-3 text-emerald-mintSoft focus:outline-none focus:border-emerald-mint/40"
          >
            <option value="TNLH">Texas No-Limit Hold'em</option>
            <option value="PLO">Pot-Limit Omaha</option>
            <option value="7CS">7 Card Stud</option>
            <option value="Mixed">Mixed Games</option>
          </select>
        </div>

        {/* Tournament Specific Fields */}
        {eventType === "tournament" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                Buyin
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("buyin", Math.max(0, formData.buyin - 10))}
                  className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                >
                  <Minus className="w-4 h-4 text-emerald-mint" />
                </button>
                <span className="text-emerald-mint font-semibold">${formData.buyin}</span>
                <button
                  type="button"
                  onClick={() => handleInputChange("buyin", formData.buyin + 10)}
                  className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                >
                  <Plus className="w-4 h-4 text-emerald-mint" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                  Number of Tables
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("numberOfTables", Math.max(1, formData.numberOfTables - 1))}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-emerald-mint" />
                  </button>
                  <span className="text-emerald-mint font-semibold">{formData.numberOfTables}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange("numberOfTables", formData.numberOfTables + 1)}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-emerald-mint" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                  Players Per Table
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("playersPerTable", Math.max(2, formData.playersPerTable - 1))}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-emerald-mint" />
                  </button>
                  <span className="text-emerald-mint font-semibold">{formData.playersPerTable}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange("playersPerTable", Math.min(10, formData.playersPerTable + 1))}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-emerald-mint" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                  Starting Stack
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("startingStack", Math.max(1000, formData.startingStack - 5000))}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-emerald-mint" />
                  </button>
                  <span className="text-emerald-mint font-semibold">{formData.startingStack.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange("startingStack", formData.startingStack + 5000)}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-emerald-mint" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                  Starting Blinds
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("startingBlinds", Math.max(25, formData.startingBlinds - 25))}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-emerald-mint" />
                  </button>
                  <span className="text-emerald-mint font-semibold">{formData.startingBlinds}/{formData.startingBlinds * 2}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange("startingBlinds", formData.startingBlinds + 25)}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-emerald-mint" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                Time Per Level (minutes)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("timePerLevel", Math.max(10, formData.timePerLevel - 5))}
                  className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                >
                  <Minus className="w-4 h-4 text-emerald-mint" />
                </button>
                <span className="text-emerald-mint font-semibold">{formData.timePerLevel} min</span>
                <button
                  type="button"
                  onClick={() => handleInputChange("timePerLevel", formData.timePerLevel + 5)}
                  className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                >
                  <Plus className="w-4 h-4 text-emerald-mint" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cash Game Specific Fields */}
        {eventType === "cash" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                Blinds
              </label>
              <input
                type="text"
                value={formData.blinds}
                onChange={(e) => handleInputChange("blinds", e.target.value)}
                placeholder="1/2"
                className="w-full bg-white/5 border border-emerald-mint/20 rounded-lg px-4 py-3 text-emerald-mintSoft placeholder-emerald-mintSoft/50 focus:outline-none focus:border-emerald-mint/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                  Number of Tables
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("numberOfTables", Math.max(1, formData.numberOfTables - 1))}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-emerald-mint" />
                  </button>
                  <span className="text-emerald-mint font-semibold">{formData.numberOfTables}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange("numberOfTables", formData.numberOfTables + 1)}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-emerald-mint" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
                  Players Per Table
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("playersPerTable", Math.max(2, formData.playersPerTable - 1))}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-emerald-mint" />
                  </button>
                  <span className="text-emerald-mint font-semibold">{formData.playersPerTable}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange("playersPerTable", Math.min(10, formData.playersPerTable + 1))}
                    className="w-8 h-8 bg-emerald-mint/20 rounded-lg flex items-center justify-center hover:bg-emerald-mint/30 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-emerald-mint" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-emerald-mintSoft mb-2">
            Remarks
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => handleInputChange("remarks", e.target.value)}
            placeholder="Additional details about the event..."
            rows={3}
            className="w-full bg-white/5 border border-emerald-mint/20 rounded-lg px-4 py-3 text-emerald-mintSoft placeholder-emerald-mintSoft/50 focus:outline-none focus:border-emerald-mint/40 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
}



