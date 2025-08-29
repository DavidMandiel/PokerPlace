"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Star, Users, Calendar, Clock, Trophy } from "lucide-react";
import Image from "next/image";
import SuccessState from "../../components/SuccessState";

type Event = {
  id: string;
  title: string;
  type: "tournament" | "cash";
  gameType: string;
  buyin: number;
  date: string;
  time: string;
  availableSeats: number;
  totalSeats: number;
  image?: string;
  status: "registered" | "available" | "friends";
  host: {
    name: string;
    rating: number;
    eventsCreated: number;
    avatar?: string;
  };
  location: string;
  tournamentStructure?: {
    initialStack: number;
    startingBlinds: string;
    timePerLevel: number;
    anteFromLevel: number;
    lateRegUntil: number;
  };
  remarks: string;
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockEvent: Event = {
      id: params.id as string,
      title: "Monday Night NL Tournament",
      type: "tournament",
      gameType: "TNLH",
      buyin: 500,
      date: "27/2/2021",
      time: "20:00",
      availableSeats: 6,
      totalSeats: 27,
      status: "available",
      host: {
        name: "John Dow",
        rating: 3,
        eventsCreated: 212,
        avatar: "/lib/images/default-avatar.png"
      },
      location: "6391 Elgin St. Celina, Delaware 10299",
      tournamentStructure: {
        initialStack: 30000,
        startingBlinds: "100/100",
        timePerLevel: 20,
        anteFromLevel: 3,
        lateRegUntil: 6
      },
      remarks: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    };

    setEvent(mockEvent);
    setLoading(false);
  }, [params.id]);

  const handleAction = async (action: string) => {
    setActionLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set success message based on action
    let message = "";
    switch (action) {
      case "register":
        message = "Successfully registered for the event!";
        break;
      case "leave":
        message = "Successfully left the event!";
        break;
      case "request":
        message = "Request to join sent successfully!";
        break;
      default:
        message = "Action completed successfully!";
    }
    
    setSuccessMessage(message);
    setShowSuccess(true);
    setActionLoading(false);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    router.push('/dashboard');
  };

  const getActionButton = () => {
    if (!event) return null;

    switch (event.status) {
      case "registered":
        return (
          <button
            onClick={() => handleAction("leave")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Leave Event"}
          </button>
        );
      case "friends":
        return (
          <button
            onClick={() => handleAction("register")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Register"}
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleAction("request")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Request To Join"}
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-modern h-8 w-8 mx-auto mb-4"></div>
          <p className="text-emerald-mintSoft">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <p className="text-emerald-mintSoft">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-app">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-mint/20">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-mintSoft hover:text-emerald-mint transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-lg font-semibold text-glow">{event.title}</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        <div className="p-4 space-y-6">
          {/* Event Image */}
          <div className="w-full h-48 bg-gradient-to-br from-emerald-dark/30 to-teal-dark/30 rounded-xl border border-emerald-mint/20 flex items-center justify-center">
            <Trophy className="w-16 h-16 text-emerald-mint/50" />
          </div>

          {/* Action Button */}
          <div className="mb-6">
            {getActionButton()}
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Event Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-glow mb-3">Event Details</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-mintSoft text-sm">Tournament Type:</span>
                  <span className="text-emerald-mint font-medium">NL Freez-Out</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-emerald-mintSoft text-sm">Buyin:</span>
                  <span className="text-emerald-mint font-medium">${event.buyin}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-emerald-mintSoft text-sm">Date & Time:</span>
                  <span className="text-emerald-mint font-medium">{event.date} At {event.time}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-emerald-mintSoft text-sm">Available seats:</span>
                  <span className="text-emerald-mint font-medium">{event.availableSeats}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-emerald-mintSoft text-sm">Total Seats:</span>
                  <span className="text-emerald-mint font-medium">{event.totalSeats}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Tournament Structure */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-glow mb-3">Tournament Structure</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-mintSoft text-sm">Time Per Level:</span>
                  <span className="text-emerald-mint font-medium">{event.tournamentStructure?.timePerLevel} Min LVL</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-emerald-mintSoft text-sm">Initial Stack:</span>
                  <span className="text-emerald-mint font-medium">{event.tournamentStructure?.initialStack.toLocaleString()} chips</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-emerald-mintSoft text-sm">First LVL:</span>
                  <span className="text-emerald-mint font-medium">{event.tournamentStructure?.startingBlinds}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-emerald-mintSoft text-sm">Ante from LVL:</span>
                  <span className="text-emerald-mint font-medium">{event.tournamentStructure?.anteFromLevel}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-emerald-mintSoft text-sm">Late Reg:</span>
                  <span className="text-emerald-mint font-medium">until Lvl {event.tournamentStructure?.lateRegUntil}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <h2 className="text-lg font-semibold text-glow mb-3">Remarks</h2>
            <p className="text-emerald-mintSoft text-sm leading-relaxed">
              {event.remarks}
            </p>
          </div>

          {/* Hosted By Section */}
          <div className="border-t border-emerald-mint/20 pt-6">
            <h2 className="text-lg font-semibold text-glow mb-4">Hosted By</h2>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-mint/20 rounded-full flex items-center justify-center">
                {event.host.avatar ? (
                  <Image 
                    src={event.host.avatar} 
                    alt={event.host.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <span className="text-emerald-mint font-semibold text-lg">
                    {event.host.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-glow">{event.host.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < event.host.rating ? 'text-yellow-400 fill-current' : 'text-emerald-mintSoft'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-emerald-mintSoft text-sm">Rated: {event.host.rating}/5</span>
                </div>
                <p className="text-emerald-mintSoft text-sm mt-1">
                  Events Created: {event.host.eventsCreated}
                </p>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-2 mt-4 text-emerald-mintSoft">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{event.location}</span>
            </div>
          </div>

          {/* More Events from Host */}
          <div className="border-t border-emerald-mint/20 pt-6">
            <h2 className="text-lg font-semibold text-glow mb-4">More events from {event.host.name}</h2>
            
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 min-w-[200px] border border-emerald-mint/10">
                  <div className="w-full h-20 bg-emerald-mint/10 rounded-lg mb-2"></div>
                  <h4 className="font-medium text-sm text-glow">TNLH CASH</h4>
                  <p className="text-emerald-mintSoft text-xs">BUYIN: $100</p>
                  <p className="text-emerald-mintSoft text-xs">DATE: 24/2/2021</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {showSuccess && (
        <SuccessState
          message={successMessage}
          onComplete={handleSuccessComplete}
          duration={3000}
        />
      )}
    </>
  );
}



