"use client";
import Link from "next/link";
import { Star, Clock, MapPin, Users, DollarSign, ExternalLink, Eye, Lock } from "lucide-react";

export type EventType = "tournament" | "cash";
export type EventStatus = "public" | "private" | "secret";
export type UserEventStatus = "upcoming" | "friends" | "other" | "registered";

export interface Event {
  id: string;
  title: string;
  type: EventType;
  gameType: string;
  buyin: number;
  date: string;
  time: string;
  location: string;
  availableSeats: number;
  totalSeats: number;
  image?: string;
  privacy: EventStatus;
  host: {
    name: string;
    rating: number;
    eventsCreated: number;
  };
  userStatus: UserEventStatus;
  isClubMember?: boolean;
}

interface EventCardProps {
  event: Event;
  showActionButton?: boolean;
  variant?: "upcoming" | "other" | "registered";
}

export default function EventCard({ event, showActionButton = true, variant = "upcoming" }: EventCardProps) {
  const progressPercentage = (event.availableSeats / event.totalSeats) * 100;
  
  const getActionButton = () => {
    if (!showActionButton) return null;

    switch (variant) {
      case "upcoming":
        return (
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3 rounded-lg transition-colors font-medium">
            REGISTER
          </button>
        );
      case "other":
        if (event.privacy === "private" && !event.isClubMember) {
          return (
            <button className="w-full bg-pink-500 hover:bg-pink-600 text-white text-xs py-1.5 px-3 rounded-lg transition-colors font-medium">
              Request To Join Club
            </button>
          );
        }
        return (
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3 rounded-lg transition-colors font-medium">
            REGISTER
          </button>
        );
      case "registered":
        return (
          <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-xs py-1.5 px-3 rounded-lg transition-colors font-medium">
            unregister
          </button>
        );
      default:
        return (
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3 rounded-lg transition-colors font-medium">
            REGISTER
          </button>
        );
    }
  };

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-48">
        {/* Header with background image - Fixed height */}
        <div className="h-20 relative">
          {event.image ? (
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="/icon-app.png" 
              alt="PokerPlace"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white text-sm font-bold mb-1 truncate">{event.title}</h3>
            <p className="text-white/90 text-xs font-medium truncate">{event.gameType}</p>
          </div>
        </div>

        {/* Body with event details - Fixed height content */}
        <div className="p-3 h-20 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-medium">BUYIN: ${event.buyin}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-medium">SEATS: {event.availableSeats}/{event.totalSeats}</span>
            </div>

            <div className="text-xs text-gray-600">
              <span className="font-medium">DATE: {event.date}</span>
            </div>
          </div>

          {/* Progress bar - Fixed position */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Footer with action button - Fixed height */}
        {showActionButton && (
          <div className="px-3 pb-3 h-8 flex items-center">
            {getActionButton()}
          </div>
        )}
      </div>
    </Link>
  );
}





