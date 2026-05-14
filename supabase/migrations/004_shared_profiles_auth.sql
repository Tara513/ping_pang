-- ============================================================
-- Shared auth/profile contract between Training and Ranking
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

UPDATE profiles
SET updated_at = COALESCE(updated_at, created_at, now()),
    onboarding_completed = COALESCE(onboarding_completed, false);

ALTER TABLE profiles
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN onboarding_completed SET DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Recreate profile policies with explicit ownership checks.
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can read ELO, but client-side user sessions must not write it.
-- Ranking can still update ELO through service-role/admin flows that bypass RLS.
DROP POLICY IF EXISTS "ELO ratings: own write" ON elo_ratings;
DROP POLICY IF EXISTS "ELO history: own only" ON elo_history;
DROP POLICY IF EXISTS "ELO history: own select" ON elo_history;
CREATE POLICY "ELO history: own select"
  ON elo_history FOR SELECT
  USING (auth.uid() = player_id);

-- Robust auto-profile creation for both apps.
-- The profile id is always auth.users.id, so Training and Ranking share one row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  candidate_username TEXT;
  suffix INTEGER := 0;
BEGIN
  base_username := LOWER(REGEXP_REPLACE(
    COALESCE(
      NULLIF(new.raw_user_meta_data->>'username', ''),
      SPLIT_PART(COALESCE(new.email, ''), '@', 1),
      'player'
    ),
    '[^a-z0-9_]',
    '',
    'g'
  ));

  IF base_username IS NULL OR LENGTH(base_username) < 2 THEN
    base_username := 'player_' || SUBSTRING(new.id::TEXT FROM 1 FOR 8);
  END IF;

  candidate_username := LEFT(base_username, 32);

  WHILE EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE username = candidate_username
      AND id <> new.id
  ) LOOP
    suffix := suffix + 1;
    candidate_username := LEFT(base_username, 27) || '_' || suffix::TEXT;
  END LOOP;

  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    country,
    onboarding_completed
  )
  VALUES (
    new.id,
    candidate_username,
    NULLIF(new.raw_user_meta_data->>'full_name', ''),
    NULLIF(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NULLIF(new.raw_user_meta_data->>'country', ''), 'FR'),
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    country = COALESCE(public.profiles.country, EXCLUDED.country);

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
