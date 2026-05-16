import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import {
  getMyPgrMatchesSafe,
  getMyPgrProfileSafe,
  getMyPgrRatingHistorySafe,
  getPgrLeaderboardSafe,
} from "@/lib/data/pgr"
import type {
  Database,
  PgrLeaderboardEntry,
  PgrMatch,
  PgrProfile,
  PgrRatingHistoryPoint,
  Profile,
} from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export interface TrainingDashboardActivity {
  id: string
  feed_type: "session" | "match"
  date: string
  session_type?: string
  duration_min?: number
  feeling?: number | null
  opponent_name?: string
  result?: "win" | "loss" | null
}

export interface TrainingDashboardData {
  profile: Profile
  stats: {
    hours_this_week: number
    sessions_this_week: number
    matches_this_week: number
    streak_days: number
    weekly_goal: {
      sessions_per_week: number
      hours_per_week: number
      matches_per_week: number
    }
    sessions_goal_progress: number
    hours_goal_progress: number
  }
  feed: TrainingDashboardActivity[]
  latestRecommendation: string | null
}

export interface TrainingProfileData {
  profile: Profile
  sessions: Array<Database["public"]["Tables"]["sessions"]["Row"]>
  matches: Array<Database["public"]["Tables"]["matches"]["Row"]>
  equipment: Database["public"]["Tables"]["equipment"]["Row"] | null
  badges: Array<Database["public"]["Tables"]["badges"]["Row"]>
  pgrProfile: PgrProfile | null
}

export interface PgrPageData {
  profile: Profile
  pgrProfile: PgrProfile | null
  ratingHistory: PgrRatingHistoryPoint[]
  pgrMatches: PgrMatch[]
  leaderboard: PgrLeaderboardEntry[]
}

function sanitizeUsername(value: string | null | undefined, fallback: string) {
  const clean = (value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32)

  return clean.length >= 2 ? clean : fallback
}

function profileFromUser(user: User) {
  const metadata = user.user_metadata || {}
  const emailName = user.email?.split("@")[0]
  const fallback = `player_${user.id.slice(0, 8)}`

  return {
    id: user.id,
    username: sanitizeUsername(
      typeof metadata.username === "string" ? metadata.username : emailName,
      fallback
    ),
    full_name: typeof metadata.full_name === "string" ? metadata.full_name : null,
    avatar_url: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    country: typeof metadata.country === "string" && metadata.country ? metadata.country : "FR",
  }
}

export async function ensureSharedProfile(
  supabase: SupabaseServerClient,
  user: User
): Promise<Profile> {
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (lookupError) {
    throw new Error(lookupError.message)
  }

  if (existing) return existing as Profile

  const baseProfile = profileFromUser(user)
  const attempts = [
    baseProfile,
    { ...baseProfile, username: `${baseProfile.username.slice(0, 23)}_${user.id.slice(0, 8)}` },
  ]

  let lastError: string | null = null
  for (const payload of attempts) {
    const { data, error } = await supabase
      .from("profiles")
      .insert(payload)
      .select("*")
      .single()

    if (!error && data) return data as Profile
    lastError = error?.message || null
  }

  throw new Error(lastError || "Impossible de créer le profil partagé")
}

export async function requireSharedProfile() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const profile = await ensureSharedProfile(supabase, user)
  return { supabase, user, profile }
}

function currentWeekStartIso() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

function getStreakDays(sessions: Array<{ date: string }>) {
  const sessionDays = new Set(sessions.map((session) => session.date))
  let streak = 0
  const cursor = new Date()

  while (sessionDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export async function getTrainingDashboardData(): Promise<TrainingDashboardData> {
  const { supabase, profile } = await requireSharedProfile()
  const weekStart = currentWeekStartIso()

  const [
    { data: sessions, error: sessionsError },
    { data: matches, error: matchesError },
    { data: allSessions, error: allSessionsError },
    { data: allMatches, error: allMatchesError },
    { data: goal, error: goalError },
    { data: recaps, error: recapsError },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("id,date,session_type,duration_min,feeling")
      .eq("player_id", profile.id)
      .gte("date", weekStart)
      .order("date", { ascending: false }),
    supabase
      .from("matches")
      .select("id,date,opponent_name,result")
      .eq("player_id", profile.id)
      .gte("date", weekStart)
      .order("date", { ascending: false }),
    supabase
      .from("sessions")
      .select("id,date,session_type,duration_min,feeling")
      .eq("player_id", profile.id)
      .order("date", { ascending: false })
      .limit(30),
    supabase
      .from("matches")
      .select("id,date,opponent_name,result")
      .eq("player_id", profile.id)
      .order("date", { ascending: false })
      .limit(30),
    supabase
      .from("weekly_goals")
      .select("*")
      .eq("player_id", profile.id)
      .eq("week_start", weekStart)
      .maybeSingle(),
    supabase
      .from("recaps")
      .select("content")
      .eq("player_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ])

  if (sessionsError) throw new Error(sessionsError.message)
  if (matchesError) throw new Error(matchesError.message)
  if (allSessionsError) throw new Error(allSessionsError.message)
  if (allMatchesError) throw new Error(allMatchesError.message)
  if (goalError) throw new Error(goalError.message)
  if (recapsError) throw new Error(recapsError.message)

  const weekSessions = sessions || []
  const weekMatches = matches || []
  const targetSessions = goal?.target_sessions || 3
  const targetHours = Number(goal?.target_hours || 5)
  const hoursThisWeek =
    Math.round(
      (weekSessions.reduce((sum, session) => sum + Number(session.duration_min || 0), 0) / 60) *
        10
    ) / 10

  const feed: TrainingDashboardActivity[] = [
    ...(allSessions || []).map((session) => ({
      id: session.id,
      feed_type: "session" as const,
      date: session.date,
      session_type: session.session_type,
      duration_min: session.duration_min,
      feeling: session.feeling,
    })),
    ...(allMatches || []).map((match) => ({
      id: match.id,
      feed_type: "match" as const,
      date: match.date,
      opponent_name: match.opponent_name,
      result: match.result,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const recapContent = recaps?.[0]?.content as
    | { recommandations?: string[]; improvements?: string[] }
    | undefined

  return {
    profile,
    stats: {
      hours_this_week: hoursThisWeek,
      sessions_this_week: weekSessions.length,
      matches_this_week: weekMatches.length,
      streak_days: getStreakDays(allSessions || []),
      weekly_goal: {
        sessions_per_week: targetSessions,
        hours_per_week: targetHours,
        matches_per_week: 1,
      },
      sessions_goal_progress: Math.min(100, (weekSessions.length / targetSessions) * 100),
      hours_goal_progress: Math.min(100, (hoursThisWeek / targetHours) * 100),
    },
    feed,
    latestRecommendation:
      recapContent?.recommandations?.[0] || recapContent?.improvements?.[0] || null,
  }
}

export async function getTrainingProfileData(): Promise<TrainingProfileData> {
  const { supabase, profile } = await requireSharedProfile()

  const [
    { data: sessions, error: sessionsError },
    { data: matches, error: matchesError },
    { data: equipment, error: equipmentError },
    { data: badges, error: badgesError },
    pgrProfile,
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("player_id", profile.id)
      .order("date", { ascending: false }),
    supabase
      .from("matches")
      .select("*")
      .eq("player_id", profile.id)
      .order("date", { ascending: false }),
    supabase
      .from("equipment")
      .select("*")
      .eq("player_id", profile.id)
      .eq("is_current", true)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("badges")
      .select("*")
      .eq("player_id", profile.id)
      .order("earned_at", { ascending: false }),
    getMyPgrProfileSafe(),
  ])

  if (sessionsError) throw new Error(sessionsError.message)
  if (matchesError) throw new Error(matchesError.message)
  if (equipmentError) throw new Error(equipmentError.message)
  if (badgesError) throw new Error(badgesError.message)

  return {
    profile,
    sessions: sessions || [],
    matches: matches || [],
    equipment: equipment || null,
    badges: badges || [],
    pgrProfile,
  }
}

export async function getEloPageData(): Promise<PgrPageData> {
  const { profile } = await requireSharedProfile()
  const [pgrProfile, ratingHistory, pgrMatches, leaderboard] = await Promise.all([
    getMyPgrProfileSafe(),
    getMyPgrRatingHistorySafe(100),
    getMyPgrMatchesSafe({ limit: 20 }),
    getPgrLeaderboardSafe({ limit: 20 }),
  ])

  return {
    profile,
    pgrProfile,
    ratingHistory,
    pgrMatches,
    leaderboard,
  }
}
