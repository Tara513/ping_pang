-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  country       TEXT DEFAULT 'FR',
  city          TEXT,
  club          TEXT,
  play_style    TEXT CHECK (play_style IN ('attacker','defender','allround','penhold','other')),
  dominant_hand TEXT CHECK (dominant_hand IN ('right','left')),
  level         TEXT CHECK (level IN ('beginner','intermediate','advanced','competitive','elite')),
  is_coach      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blade         TEXT,
  rubber_fh     TEXT,
  rubber_bh     TEXT,
  thickness_fh  DECIMAL(3,1),
  thickness_bh  DECIMAL(3,1),
  is_current    BOOLEAN DEFAULT true,
  started_at    DATE NOT NULL,
  ended_at      DATE,
  notes         TEXT
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type    TEXT CHECK (session_type IN ('technique','physique','match','service','competition','chill')),
  duration_min    INTEGER NOT NULL,
  date            DATE NOT NULL,
  location        TEXT,
  location_lat    DECIMAL(10,7),
  location_lng    DECIMAL(10,7),
  notes           TEXT,
  exercises       JSONB DEFAULT '[]',
  feeling         INTEGER CHECK (feeling BETWEEN 1 AND 5),
  fatigue         INTEGER CHECK (fatigue BETWEEN 1 AND 5),
  motivation      INTEGER CHECK (motivation BETWEEN 1 AND 5),
  confidence      INTEGER CHECK (confidence BETWEEN 1 AND 5),
  has_description BOOLEAN DEFAULT false,
  coach_comment   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  opponent_name   TEXT NOT NULL,
  opponent_id     UUID REFERENCES profiles(id),
  result          TEXT CHECK (result IN ('win','loss')),
  score_player    INTEGER[],
  score_opponent  INTEGER[],
  sets_won        INTEGER,
  sets_lost       INTEGER,
  match_type      TEXT CHECK (match_type IN ('friendly','league','tournament','training')),
  date            DATE NOT NULL,
  location        TEXT,
  location_lat    DECIMAL(10,7),
  location_lng    DECIMAL(10,7),
  notes           TEXT,
  ball_data       JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ELO ratings
CREATE TABLE IF NOT EXISTS elo_ratings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  federation    TEXT NOT NULL,
  elo           INTEGER DEFAULT 1500,
  rank_points   INTEGER DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, federation)
);

-- ELO history
CREATE TABLE IF NOT EXISTS elo_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  federation  TEXT NOT NULL,
  elo_before  INTEGER,
  elo_after   INTEGER,
  delta       INTEGER,
  match_id    UUID REFERENCES matches(id),
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Weekly goals
CREATE TABLE IF NOT EXISTS weekly_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  target_hours    DECIMAL(4,1),
  target_sessions INTEGER,
  notes           TEXT,
  achieved        BOOLEAN DEFAULT false
);

-- Follows
CREATE TABLE IF NOT EXISTS follows (
  follower_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type  TEXT NOT NULL,
  earned_at   TIMESTAMPTZ DEFAULT now(),
  metadata    JSONB DEFAULT '{}'
);

-- Pro players
CREATE TABLE IF NOT EXISTS pro_players (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  country       TEXT,
  ittf_ranking  INTEGER,
  ittf_points   INTEGER,
  play_style    TEXT,
  birth_year    INTEGER,
  club          TEXT,
  equipment     JSONB,
  bio           TEXT,
  image_url     TEXT,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE elo_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE elo_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_players ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Equipment: own only
CREATE POLICY "Equipment: own only" ON equipment USING (auth.uid() = player_id);

-- Sessions: own write, public read
CREATE POLICY "Sessions: public read" ON sessions FOR SELECT USING (true);
CREATE POLICY "Sessions: own write" ON sessions FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Sessions: own update" ON sessions FOR UPDATE USING (auth.uid() = player_id);
CREATE POLICY "Sessions: own delete" ON sessions FOR DELETE USING (auth.uid() = player_id);

-- Matches: own write, public read
CREATE POLICY "Matches: public read" ON matches FOR SELECT USING (true);
CREATE POLICY "Matches: own write" ON matches FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Matches: own update" ON matches FOR UPDATE USING (auth.uid() = player_id);
CREATE POLICY "Matches: own delete" ON matches FOR DELETE USING (auth.uid() = player_id);

-- ELO: public read, own write
CREATE POLICY "ELO ratings: public read" ON elo_ratings FOR SELECT USING (true);
CREATE POLICY "ELO ratings: own write" ON elo_ratings USING (auth.uid() = player_id);

-- ELO history: own only
CREATE POLICY "ELO history: own only" ON elo_history USING (auth.uid() = player_id);

-- Weekly goals: own only
CREATE POLICY "Weekly goals: own only" ON weekly_goals USING (auth.uid() = player_id);

-- Follows: public read, own write
CREATE POLICY "Follows: public read" ON follows FOR SELECT USING (true);
CREATE POLICY "Follows: own write" ON follows USING (auth.uid() = follower_id);

-- Badges: public read, own write
CREATE POLICY "Badges: public read" ON badges FOR SELECT USING (true);
CREATE POLICY "Badges: own write" ON badges USING (auth.uid() = player_id);

-- Pro players: public read only
CREATE POLICY "Pro players: public read" ON pro_players FOR SELECT USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    LOWER(REGEXP_REPLACE(SPLIT_PART(new.email, '@', 1), '[^a-z0-9_]', '', 'g')),
    new.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
