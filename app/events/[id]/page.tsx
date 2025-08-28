"use client";
import { Calendar, MapPin, Users, Clock, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EventDetailsPage() {
  // Placeholder static page for MVP shell
  return (
    <div className="bg-app space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Event Details</h1>
          <p className="text-emerald-mintSoft mt-1">
            View event information and manage your RSVP
          </p>
        </div>
        <Link 
          href="/events" 
          className="text-emerald-mintSoft hover:text-emerald-mint hover:underline underline-offset-4 transition-colors"
        >
          ← Back to Events
        </Link>
      </div>

      <div className="card-emerald p-8 animate-slide-up">
        <div className="space-y-6">
          {/* Event Info */}
          <div>
            <h2 className="text-2xl font-semibold text-glow mb-4">Friday Night Tournament</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="icon-modern">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-emerald-mintSoft">Starts</div>
                  <div className="font-medium text-glow">Friday, Dec 25 • 7:00 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="icon-modern">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-emerald-mintSoft">Venue</div>
                  <div className="font-medium text-glow">Community Center, 123 Main St</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="icon-modern">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-emerald-mintSoft">Players</div>
                  <div className="font-medium text-glow">12 registered • 8 seats available</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="icon-modern">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-emerald-mintSoft">Club</div>
                  <div className="font-medium text-glow">Tel Aviv Poker Club</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-glow mb-2">About this event</h3>
            <p className="text-emerald-mintSoft">
              Join us for our weekly Friday night tournament! This is a friendly competition 
              open to all skill levels. We'll be playing Texas Hold'em with a $20 buy-in. 
              Prizes will be awarded to the top 3 players.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="btn-accent rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              RSVP to Event
            </button>
            <button className="btn-outline-modern rounded-xl px-6 py-3 text-sm font-medium">
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </button>
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-8 p-4 rounded-xl bg-emerald-mint/10 border border-emerald-mint/20">
            <h4 className="font-semibold text-emerald-mint mb-2">Coming Soon</h4>
            <p className="text-sm text-emerald-mintSoft">
              Event details, RSVP functionality, and chat features will be available soon. 
              This page will show real event information, allow you to RSVP, and connect with other players.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



