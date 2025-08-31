"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Plus, Minus, Image } from "lucide-react";

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

  const NumberInput = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 999 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    min?: number; 
    max?: number; 
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
          className="flex-1 input-clean text-center"
          min={min}
          max={max}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container-mobile">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Create New Event</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Event Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Sunday Omaha Cash"
                className="input-clean"
                required
              />
            </div>

            {/* Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Picture
              </label>
              <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Date & Time</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="input-clean"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="input-clean"
                  required
                />
              </div>
            </div>

            {/* Event Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="tournament"
                    checked={eventType === "tournament"}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Tournament</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="cash"
                    checked={eventType === "cash"}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Cash</span>
                </label>
              </div>
            </div>

            {/* Game Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game Type
              </label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="input-clean"
              >
                <option value="TNLH">TNLH</option>
                <option value="PLO">PLO</option>
                <option value="7CS">7CS</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            {/* Tournament-specific fields */}
            {eventType === "tournament" && (
              <>
                <NumberInput
                  label="BuyIn"
                  value={formData.buyin}
                  onChange={(value) => handleInputChange("buyin", value)}
                  min={1}
                  max={10000}
                />
                <NumberInput
                  label="Number Of Tables"
                  value={formData.numberOfTables}
                  onChange={(value) => handleInputChange("numberOfTables", value)}
                  min={1}
                  max={20}
                />
                <NumberInput
                  label="Player Per Table"
                  value={formData.playersPerTable}
                  onChange={(value) => handleInputChange("playersPerTable", value)}
                  min={2}
                  max={10}
                />
                <NumberInput
                  label="Starting Stack"
                  value={formData.startingStack}
                  onChange={(value) => handleInputChange("startingStack", value)}
                  min={1000}
                  max={100000}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Blinds
                  </label>
                  <div className="flex items-center gap-2">
                    <NumberInput
                      label=""
                      value={formData.startingBlinds}
                      onChange={(value) => handleInputChange("startingBlinds", value)}
                      min={10}
                      max={1000}
                    />
                    <span className="text-gray-500">/</span>
                    <NumberInput
                      label=""
                      value={formData.startingBlinds * 2}
                      onChange={(value) => handleInputChange("startingBlinds", value / 2)}
                      min={20}
                      max={2000}
                    />
                  </div>
                </div>
                <NumberInput
                  label="Time Per Level"
                  value={formData.timePerLevel}
                  onChange={(value) => handleInputChange("timePerLevel", value)}
                  min={5}
                  max={60}
                />
              </>
            )}

            {/* Cash-specific fields */}
            {eventType === "cash" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blinds
                  </label>
                  <div className="flex items-center gap-2">
                    <NumberInput
                      label=""
                      value={1}
                      onChange={() => {}}
                      min={1}
                      max={100}
                    />
                    <span className="text-gray-500">/</span>
                    <NumberInput
                      label=""
                      value={2}
                      onChange={() => {}}
                      min={2}
                      max={200}
                    />
                  </div>
                </div>
                <NumberInput
                  label="Number Of Tables"
                  value={formData.numberOfTables}
                  onChange={(value) => handleInputChange("numberOfTables", value)}
                  min={1}
                  max={20}
                />
                <NumberInput
                  label="Player Per Table"
                  value={formData.playersPerTable}
                  onChange={(value) => handleInputChange("playersPerTable", value)}
                  min={2}
                  max={10}
                />
              </>
            )}

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                className="input-clean h-24 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full btn-primary"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}