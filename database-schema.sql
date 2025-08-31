-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clubs table
CREATE TABLE public.clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  visibility TEXT CHECK (visibility IN ('public', 'private', 'hidden')) DEFAULT 'public',
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  city TEXT,
  visibility TEXT CHECK (visibility IN ('public', 'private', 'secret')) DEFAULT 'public',
  event_type TEXT CHECK (event_type IN ('tournament', 'cash')) NOT NULL,
  game_type TEXT CHECK (game_type IN ('TNLH', 'PLO', '7CS', 'Mixed')) NOT NULL,
  buyin INTEGER,
  max_players INTEGER,
  current_players INTEGER DEFAULT 0,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create club members table
CREATE TABLE public.club_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Create event attendees table
CREATE TABLE public.event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('confirmed', 'maybe', 'declined')) DEFAULT 'confirmed',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for clubs
CREATE POLICY "Anyone can view public clubs" ON public.clubs
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Club owners can view their clubs" ON public.clubs
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Club owners can update their clubs" ON public.clubs
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create clubs" ON public.clubs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for events
CREATE POLICY "Anyone can view public events" ON public.events
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Club members can view private events" ON public.events
  FOR SELECT USING (
    visibility = 'private' AND 
    EXISTS (
      SELECT 1 FROM public.club_members 
      WHERE club_id = events.club_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators can view their events" ON public.events
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Event creators can update their events" ON public.events
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for club_members
CREATE POLICY "Club members can view club membership" ON public.club_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clubs 
      WHERE id = club_members.club_id 
      AND (visibility = 'public' OR owner_id = auth.uid())
    )
  );

CREATE POLICY "Club owners can manage membership" ON public.club_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clubs 
      WHERE id = club_members.club_id 
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for event_attendees
CREATE POLICY "Anyone can view event attendees for public events" ON public.event_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_attendees.event_id 
      AND visibility = 'public'
    )
  );

CREATE POLICY "Users can manage their own attendance" ON public.event_attendees
  FOR ALL USING (user_id = auth.uid());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, nickname, country, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'nickname', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_clubs_visibility ON public.clubs(visibility);
CREATE INDEX idx_clubs_owner ON public.clubs(owner_id);
CREATE INDEX idx_events_starts_at ON public.events(starts_at);
CREATE INDEX idx_events_visibility ON public.events(visibility);
CREATE INDEX idx_events_club ON public.events(club_id);
CREATE INDEX idx_club_members_club ON public.club_members(club_id);
CREATE INDEX idx_event_attendees_event ON public.event_attendees(event_id);
