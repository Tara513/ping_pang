-- ============================================================
-- Training data hardening
-- ============================================================

-- Training is personal data. Keep reads scoped to the current user.
DROP POLICY IF EXISTS "Sessions: public read" ON sessions;
DROP POLICY IF EXISTS "Sessions: own select" ON sessions;
CREATE POLICY "Sessions: own select"
  ON sessions FOR SELECT
  USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Matches: public read" ON matches;
DROP POLICY IF EXISTS "Matches: own select" ON matches;
CREATE POLICY "Matches: own select"
  ON matches FOR SELECT
  USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Badges: public read" ON badges;
DROP POLICY IF EXISTS "Badges: own select" ON badges;
CREATE POLICY "Badges: own select"
  ON badges FOR SELECT
  USING (auth.uid() = player_id);

-- Prevent duplicate personal state.
DELETE FROM badges b
USING badges older
WHERE b.player_id = older.player_id
  AND b.badge_type = older.badge_type
  AND b.ctid > older.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_player_type_unique
  ON badges(player_id, badge_type);

DELETE FROM weekly_goals wg
USING weekly_goals older
WHERE wg.player_id = older.player_id
  AND wg.week_start = older.week_start
  AND wg.ctid > older.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_goals_player_week_unique
  ON weekly_goals(player_id, week_start);

WITH ranked_active_programs AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY player_id
      ORDER BY created_at DESC, id DESC
    ) AS active_rank
  FROM training_programs
  WHERE is_active = true
)
UPDATE training_programs tp
SET is_active = false
FROM ranked_active_programs ranked
WHERE tp.id = ranked.id
  AND ranked.active_rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_training_programs_single_active
  ON training_programs(player_id)
  WHERE is_active = true;

-- Recreate badge awarding with an explicit caller ownership check.
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_player_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_count  INTEGER;
  v_match_count    INTEGER;
  v_win_count      INTEGER;
  v_follow_count   INTEGER;
  v_distinct_types INTEGER;
  v_recent_7days   INTEGER;
BEGIN
  IF auth.uid() IS NULL OR p_player_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not allowed to award badges for this player'
      USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*)                     INTO v_session_count  FROM sessions WHERE player_id = p_player_id;
  SELECT COUNT(*)                     INTO v_match_count    FROM matches  WHERE player_id = p_player_id;
  SELECT COUNT(*)                     INTO v_win_count      FROM matches  WHERE player_id = p_player_id AND result = 'win';
  SELECT COUNT(*)                     INTO v_follow_count   FROM follows  WHERE follower_id = p_player_id;
  SELECT COUNT(DISTINCT session_type) INTO v_distinct_types FROM sessions WHERE player_id = p_player_id;
  SELECT COUNT(*)                     INTO v_recent_7days   FROM sessions WHERE player_id = p_player_id AND date >= CURRENT_DATE - 6;

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
    (b = 'first_session' AND v_session_count >= 1)   OR
    (b = 'sessions_10'   AND v_session_count >= 10)  OR
    (b = 'sessions_50'   AND v_session_count >= 50)  OR
    (b = 'centurion'     AND v_session_count >= 100) OR
    (b = 'first_match'   AND v_match_count >= 1)     OR
    (b = 'first_win'     AND v_win_count >= 1)       OR
    (b = 'social'        AND v_follow_count >= 20)   OR
    (b = 'on_fire'       AND v_recent_7days >= 7)    OR
    (b = 'all_types'     AND v_distinct_types >= 6)
  )
  ON CONFLICT (player_id, badge_type) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_award_badges(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_award_badges(UUID) TO authenticated;
