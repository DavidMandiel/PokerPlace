import Link from "next/link";
import { Users, Calendar, Trophy, MapPin, Shield, Zap } from "lucide-react";
import AuthRedirect from "./components/AuthRedirect";

export default function Home() {
  return (
    <>
      <AuthRedirect />
      <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Organize & Join
            <span className="block text-emerald-mint">Poker Events</span>
          </h1>
          <p className="text-xl text-emerald-mint/80 mb-8 max-w-2xl mx-auto">
            For organizers: Create clubs, host events, and manage your poker community with powerful tools.
            <br />
            For players: Discover local clubs, join events, and track your poker journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center justify-center rounded-lg bg-emerald text-white px-8 py-3 text-lg font-medium hover:bg-emerald-dark transition-colors"
            >
              Get Started Free
            </Link>
            <Link 
              href="/clubs" 
              className="inline-flex items-center justify-center rounded-lg border border-emerald-mint/30 px-8 py-3 text-lg font-medium text-emerald-mint hover:bg-emerald-mint/10 transition-colors"
            >
              Explore Clubs
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-emerald-mint/80 max-w-2xl mx-auto">
            From casual home games to organized tournaments, PokerPlace has the tools to make your poker community thrive.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl border border-emerald/20 bg-emerald/10 backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-emerald-mint" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Club Management</h3>
            <p className="text-emerald-mint/80">
              Create and manage poker clubs with member lists, roles, and communication tools.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl border border-emerald/20 bg-emerald/10 backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-emerald-mint" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Event Organization</h3>
            <p className="text-emerald-mint/80">
              Schedule events, manage RSVPs, and track attendance with ease.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl border border-emerald/20 bg-emerald/10 backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-emerald-mint" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Results Tracking</h3>
            <p className="text-emerald-mint/80">
              Record game results, track player statistics, and maintain leaderboards.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl border border-emerald/20 bg-emerald/10 backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-emerald-mint" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Location Discovery</h3>
            <p className="text-emerald-mint/80">
              Find poker clubs and events near you, or discover new communities.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl border border-emerald/20 bg-emerald/10 backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-emerald-mint" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Legal</h3>
            <p className="text-emerald-mint/80">
              No real-money transactions. Focus on the game and community building.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl border border-emerald/20 bg-emerald/10 backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-emerald-mint" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
            <p className="text-emerald-mint/80">
              Get started in minutes. No complex setup or technical knowledge required.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
          <p className="text-emerald-mint/80">
            See what's happening in the poker world
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="text-center p-6 rounded-xl border border-emerald/20 bg-emerald/10 backdrop-blur-sm">
            <div className="text-3xl font-bold text-emerald-mint">0</div>
            <div className="text-sm text-emerald-mint/80">Active Clubs</div>
          </div>
          <div className="text-center p-6 rounded-xl border border-emerald/20 bg-emerald/10 backdrop-blur-sm">
            <div className="text-3xl font-bold text-emerald-mint">0</div>
            <div className="text-sm text-emerald-mint/80">Upcoming Events</div>
          </div>
          <div className="text-center p-6 rounded-xl border border-emerald/20 bg-emerald/10 backdrop-blur-sm">
            <div className="text-3xl font-bold text-emerald-mint">0</div>
            <div className="text-sm text-emerald-mint/80">Players</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-emerald-mint/80 mb-8">
            Join thousands of poker players who are already organizing amazing events and building communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center justify-center rounded-lg bg-emerald text-white px-8 py-3 text-lg font-medium hover:bg-emerald-dark transition-colors"
            >
              Create Your Account
            </Link>
            <Link 
              href="/auth" 
              className="inline-flex items-center justify-center rounded-lg border border-emerald-mint/30 px-8 py-3 text-lg font-medium text-emerald-mint hover:bg-emerald-mint/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
