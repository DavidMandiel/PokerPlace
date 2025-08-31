"use client";
import Link from "next/link";
import { Star, Clock, MapPin, Users, DollarSign, ExternalLink } from "lucide-react";

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
}

export default function EventCard({ event, showActionButton = true }: EventCardProps) {
  const progressPercentage = (event.availableSeats / event.totalSeats) * 100;
  
  const getActionButton = () => {
    if (!showActionButton) return null;

    switch (event.userStatus) {
      case "registered":
        return (
          <button className="w-full btn-danger text-sm py-2 px-4 rounded-lg">
            Leave Event
          </button>
        );
      case "friends":
        return (
          <button className="w-full btn-primary text-sm py-2 px-4 rounded-lg">
            Join Game
          </button>
        );
      case "other":
        if (event.privacy === "private" && !event.isClubMember) {
          return (
            <button className="w-full btn-secondary text-sm py-2 px-4 rounded-lg">
              Request To Join Club
            </button>
          );
        }
        return (
          <button className="w-full btn-primary text-sm py-2 px-4 rounded-lg">
            Register
          </button>
        );
      default:
        return (
          <button className="w-full btn-primary text-sm py-2 px-4 rounded-lg">
            Join Game
          </button>
        );
    }
  };

  const getPrivacyBadge = () => {
    if (event.privacy === "private") {
      return (
        <div className="privacy-badge">
          <Users className="w-3 h-3" />
          <span>friends only</span>
        </div>
      );
    }
    if (event.privacy === "secret") {
      return (
        <div className="privacy-badge">
          <Star className="w-3 h-3" />
          <span>invite only</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="event-card">
        {/* Header with background image and privacy badge */}
        <div className="event-card-header">
          {getPrivacyBadge()}
          <h3 className="text-white text-lg font-bold">{event.title}</h3>
        </div>

        {/* Body with event details */}
        <div className="event-card-body">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4" />
            <span className="uppercase font-medium">{event.type}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{event.date}, {event.time}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{event.totalSeats - event.availableSeats}/{event.totalSeats} players</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <DollarSign className="w-4 h-4" />
              <span>${event.buyin}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Footer with action buttons */}
        {showActionButton && (
          <div className="event-card-footer">
            <div className="flex gap-2">
              <button className="flex-1 btn-secondary text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View Details
              </button>
              {getActionButton()}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
