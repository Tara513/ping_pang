-- ============================================================
-- Training programs
-- ============================================================
CREATE TABLE IF NOT EXISTS training_programs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  duration_weeks   INTEGER NOT NULL DEFAULT 4,
  level            TEXT CHECK (level IN ('beginner','intermediate','advanced','competitive','elite')),
  is_active        BOOLEAN DEFAULT false,
  created_by_coach BOOLEAN DEFAULT false,
  coach_id         UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Sessions planifiées dans un programme
CREATE TABLE IF NOT EXISTS program_sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id           UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  week_number          INTEGER NOT NULL CHECK (week_number >= 1),
  day_of_week          INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Lundi
  session_type         TEXT NOT NULL CHECK (session_type IN ('technique','physique','match','service','competition','chill')),
  duration_min         INTEGER,
  objectives           TEXT,
  exercises            JSONB DEFAULT '[]',
  notes                TEXT,
  completed            BOOLEAN DEFAULT false,
  completed_session_id UUID REFERENCES sessions(id)
);

-- ============================================================
-- Bilans IA (semaine / saison)
-- ============================================================
CREATE TABLE IF NOT EXISTS recaps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('week', 'season')),
  period_start   DATE NOT NULL,
  period_end     DATE NOT NULL,
  content        JSONB NOT NULL DEFAULT '{}',
  sessions_count INTEGER DEFAULT 0,
  matches_count  INTEGER DEFAULT 0,
  total_hours    DECIMAL(5,1) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Chats d'analyse (type chess.com)
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_chats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id    UUID REFERENCES matches(id) ON DELETE SET NULL,
  session_id  UUID REFERENCES sessions(id) ON DELETE SET NULL,
  title       TEXT,
  messages    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Routine sur les joueurs pros
-- ============================================================
ALTER TABLE pro_players ADD COLUMN IF NOT EXISTS routine JSONB DEFAULT '[]';

-- ============================================================
-- Index
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_training_programs_player  ON training_programs(player_id);
CREATE INDEX IF NOT EXISTS idx_program_sessions_program  ON program_sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_recaps_player_period      ON recaps(player_id, type, period_start);
CREATE INDEX IF NOT EXISTS idx_analysis_chats_player     ON analysis_chats(player_id);
CREATE INDEX IF NOT EXISTS idx_analysis_chats_match      ON analysis_chats(match_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE recaps             ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_chats     ENABLE ROW LEVEL SECURITY;

-- Training programs
CREATE POLICY "Training programs: own select"
  ON training_programs FOR SELECT
  USING (player_id = auth.uid() OR coach_id = auth.uid());

CREATE POLICY "Training programs: own insert"
  ON training_programs FOR INSERT
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Training programs: own update"
  ON training_programs FOR UPDATE
  USING (player_id = auth.uid() OR coach_id = auth.uid());

CREATE POLICY "Training programs: own delete"
  ON training_programs FOR DELETE
  USING (player_id = auth.uid());

-- Program sessions (accès via le programme parent)
CREATE POLICY "Program sessions: select via program"
  ON program_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM training_programs tp
    WHERE tp.id = program_sessions.program_id
    AND (tp.player_id = auth.uid() OR tp.coach_id = auth.uid())
  ));

CREATE POLICY "Program sessions: insert via own program"
  ON program_sessions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM training_programs tp
    WHERE tp.id = program_sessions.program_id
    AND tp.player_id = auth.uid()
  ));

CREATE POLICY "Program sessions: update via own program"
  ON program_sessions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM training_programs tp
    WHERE tp.id = program_sessions.program_id
    AND (tp.player_id = auth.uid() OR tp.coach_id = auth.uid())
  ));

CREATE POLICY "Program sessions: delete via own program"
  ON program_sessions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM training_programs tp
    WHERE tp.id = program_sessions.program_id
    AND tp.player_id = auth.uid()
  ));

-- Recaps
CREATE POLICY "Recaps: own only"
  ON recaps
  USING (player_id = auth.uid());

-- Analysis chats
CREATE POLICY "Analysis chats: own only"
  ON analysis_chats
  USING (player_id = auth.uid());

-- ============================================================
-- Fonction de vérification et attribution des badges
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_award_badges(p_player_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_count  INTEGER;
  v_match_count    INTEGER;
  v_win_count      INTEGER;
  v_follow_count   INTEGER;
  v_distinct_types INTEGER;
  v_recent_7days   INTEGER;
BEGIN
  SELECT COUNT(*)                INTO v_session_count  FROM sessions WHERE player_id = p_player_id;
  SELECT COUNT(*)                INTO v_match_count    FROM matches  WHERE player_id = p_player_id;
  SELECT COUNT(*)                INTO v_win_count      FROM matches  WHERE player_id = p_player_id AND result = 'win';
  SELECT COUNT(*)                INTO v_follow_count   FROM follows  WHERE follower_id = p_player_id;
  SELECT COUNT(DISTINCT session_type) INTO v_distinct_types FROM sessions WHERE player_id = p_player_id;
  SELECT COUNT(*)                INTO v_recent_7days   FROM sessions WHERE player_id = p_player_id AND date >= CURRENT_DATE - 6;

  INSERT INTO badges (player_id, badge_type)
  SELECT p_player_id, b
  FROM (VALUES
    ('first_session'),
    ('sessions_10'),
    ('sessions_50'),
    ('centurion'),
    ('first_match'),
    ('first_win'),
    ('social'),
    ('on_fire'),
    ('all_types')
  ) AS t(b)
  WHERE (
    (b = 'first_session' AND v_session_count >= 1)  OR
    (b = 'sessions_10'   AND v_session_count >= 10) OR
    (b = 'sessions_50'   AND v_session_count >= 50) OR
    (b = 'centurion'     AND v_session_count >= 100) OR
    (b = 'first_match'   AND v_match_count >= 1)    OR
    (b = 'first_win'     AND v_win_count >= 1)      OR
    (b = 'social'        AND v_follow_count >= 20)  OR
    (b = 'on_fire'       AND v_recent_7days >= 7)   OR
    (b = 'all_types'     AND v_distinct_types >= 6)
  )
  AND NOT EXISTS (
    SELECT 1 FROM badges WHERE player_id = p_player_id AND badge_type = b
  );
END;
$$;
