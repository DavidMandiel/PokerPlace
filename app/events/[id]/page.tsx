"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Star, Users, Calendar, Clock, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Event } from "../../components/EventCard";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockEvent: Event = {
      id: params.id as string,
      title: "Monday Night NL Tournament",
      type: "tournament",
      gameType: "TNLH",
      buyin: 100,
      date: "27/2/2021",
      time: "20:00",
      location: "6391 Elgin St. Celina, Delaware 10299",
      availableSeats: 6,
      totalSeats: 27,
      privacy: "private",
      host: {
        name: "John Dow",
        rating: 3,
        eventsCreated: 212
      },
      userStatus: "friends",
      isClubMember: true
    };

    setEvent(mockEvent);
    setLoading(false);
  }, [params.id]);

  const handleAction = async (action: string) => {
    setActionLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setActionLoading(false);
    
    // Redirect to dashboard after action
    router.push('/dashboard');
  };

  const getActionButton = () => {
    if (!event) return null;

    switch (event.userStatus) {
      case "registered":
        return (
          <button
            onClick={() => handleAction("leave")}
            className="w-full btn-danger"
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Leave Event"}
          </button>
        );
      case "friends":
        return (
          <button
            onClick={() => handleAction("register")}
            className="w-full btn-primary"
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Register"}
          </button>
        );
      case "other":
        if (event.privacy === "private" && !event.isClubMember) {
          return (
            <button
              onClick={() => handleAction("request")}
              className="w-full btn-success"
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Request To Join Club"}
            </button>
          );
        }
        return (
          <button
            onClick={() => handleAction("register")}
            className="w-full btn-primary"
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Register"}
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleAction("register")}
            className="w-full btn-primary"
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Join Game"}
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-clean h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container-mobile">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{event.title}</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        <div className="space-y-6">
          {/* Event Image */}
          <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden">
            {event.privacy === "private" && (
              <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>friends only</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <h2 className="text-white text-2xl font-bold">{event.title}</h2>
            </div>
          </div>

          {/* Action Button */}
          <div className="mb-6">
            {getActionButton()}
          </div>

          {/* Event Details */}
          <div className="card-clean p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Tournament Type:</span>
                <span className="text-gray-900 font-medium">NL Freez-Out</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Buyin:</span>
                <span className="text-gray-900 font-medium">${event.buyin}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Date & Time:</span>
                <span className="text-gray-900 font-medium">{event.date} At {event.time}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Available seats:</span>
                <span className="text-gray-900 font-medium">{event.availableSeats}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Total Seats:</span>
                <span className="text-gray-900 font-medium">{event.totalSeats}</span>
              </div>
            </div>
          </div>

          {/* Tournament Structure */}
          <div className="card-clean p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tournament Structure</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Time Per Level:</span>
                <span className="text-gray-900 font-medium">20 Min LVL</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Initial Stack:</span>
                <span className="text-gray-900 font-medium">30,000 chips</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">First LVL:</span>
                <span className="text-gray-900 font-medium">100/100</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Ante from LVL:</span>
                <span className="text-gray-900 font-medium">3</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Late Reg:</span>
                <span className="text-gray-900 font-medium">until Lvl 6</span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="card-clean p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Remarks</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          {/* Location */}
          <div className="card-clean p-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{event.location}</span>
            </div>
          </div>

          {/* Hosted By Section */}
          <div className="card-clean p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hosted By</h3>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {event.host.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{event.host.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < event.host.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">Rated: {event.host.rating}/5</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  Events Created: {event.host.eventsCreated}
                </p>
              </div>
            </div>
          </div>

          {/* More Events from Host */}
          <div className="card-clean p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">More events from {event.host.name}</h3>
            
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">TNLH CASH</h4>
                    <p className="text-gray-600 text-xs">BUYIN: $100</p>
                    <p className="text-gray-600 text-xs">AVAILABLE SEATS: 5/27</p>
                    <p className="text-gray-600 text-xs">DATE: 24/2/2021</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}