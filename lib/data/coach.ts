import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getOpenAiApiKey } from "@/lib/ai/config"
import { getMyPgrProfileSafe, getMyPgrRatingHistorySafe } from "@/lib/data/pgr"
import {
  extractSetsFromBallData,
  extractSetsFromScoreArrays,
  formatSetsForPrompt,
} from "@/lib/utils/match-sets"
import type { Exercise, PgrProfile, PgrRatingHistoryPoint, PlayerLevel, SessionType } from "@/types/database"

type JsonRecord = Record<string, unknown>

export interface CoachSetScore {
  player: number
  opponent: number
}

export interface CoachMatch {
  id: string
  opponent_name: string
  result: "win" | "loss" | null
  date: string
  source: string | null
  ranking_match_id: string | null
  sets_won: number | null
  sets_lost: number | null
  match_type: string | null
  sets: CoachSetScore[]
  sets_text: string
}

export interface CoachMatchAnalysis {
  id: string
  match_id: string
  player_id: string
  rating: number | null
  summary: string
  strengths: string[]
  weaknesses: string[]
  critical_moments: string[]
  recommendations: string[]
  model_used: string | null
  created_at: string
}

export interface CoachProgramSession {
  id: string
  program_id: string
  week_number: number
  day_of_week: number
  session_type: SessionType
  duration_min: number | null
  objectives: string | null
  exercises: Exercise[]
  notes: string | null
  completed: boolean
  completed_session_id: string | null
}

export interface CoachTrainingProgram {
  id: string
  title: string
  description: string | null
  duration_weeks: number
  level: PlayerLevel | null
  is_active: boolean
  created_by_coach: boolean
  coach_id: string | null
  created_at: string
  updated_at: string
  sessions: CoachProgramSession[]
}

export interface CoachPageData {
  profile: {
    id: string
    username: string
    full_name: string | null
    level: PlayerLevel | null
  }
  matches: CoachMatch[]
  analyses: CoachMatchAnalysis[]
  weeklyGoal: {
    target_hours: number | null
    target_sessions: number | null
    notes: string | null
  } | null
  activeProgram: {
    id: string
    title: string
    created_at: string
  } | null
  draftProgram: {
    id: string
    title: string
    created_at: string
  } | null
  pgrProfile: PgrProfile | null
  pgrRatingHistory: PgrRatingHistoryPoint[]
  aiConfigured: boolean
}

function currentWeekStartIso() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  now.setDate(now.getDate() + diff)
  now.setHours(0, 0, 0, 0)
  return now.toISOString().slice(0, 10)
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }
  return []
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function toBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback
}

function toExercises(value: unknown): Exercise[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === "string" && item.trim() !== "") {
        return { name: item.trim() }
      }

      if (typeof item !== "object" || item === null) return null
      const record = item as JsonRecord
      const name = toString(record.name)
      if (!name) return null

      return {
        name,
        duration: toNumber(record.duration) ?? undefined,
        sets: toNumber(record.sets) ?? undefined,
        reps: toNumber(record.reps) ?? undefined,
        notes: typeof record.notes === "string" ? record.notes : undefined,
      }
    })
    .filter((item): item is Exercise => item !== null)
}

function mapAnalysis(row: JsonRecord): CoachMatchAnalysis {
  return {
    id: toString(row.id),
    match_id: toString(row.match_id),
    player_id: toString(row.player_id),
    rating: toNumber(row.rating),
    summary: toString(row.summary, "Analyse enregistrée."),
    strengths: stringArray(row.strengths),
    weaknesses: stringArray(row.weaknesses),
    critical_moments: stringArray(row.critical_moments),
    recommendations: stringArray(row.recommendations),
    model_used: typeof row.model_used === "string" ? row.model_used : null,
    created_at: toString(row.created_at),
  }
}

function mapMatch(row: JsonRecord): CoachMatch {
  const setsFromBallData = extractSetsFromBallData(row.ball_data)
  const fallbackSets =
    setsFromBallData.length > 0 ? [] : extractSetsFromScoreArrays(row.score_player, row.score_opponent)
  const sets = setsFromBallData.length > 0 ? setsFromBallData : fallbackSets

  return {
    id: toString(row.id),
    opponent_name: toString(row.opponent_name, "Adversaire"),
    result: row.result === "win" || row.result === "loss" ? row.result : null,
    date: toString(row.date),
    source: typeof row.source === "string" ? row.source : null,
    ranking_match_id: typeof row.ranking_match_id === "string" ? row.ranking_match_id : null,
    sets_won: toNumber(row.sets_won),
    sets_lost: toNumber(row.sets_lost),
    match_type: typeof row.match_type === "string" ? row.match_type : null,
    sets,
    sets_text: formatSetsForPrompt(sets),
  }
}

function mapProgramSession(row: JsonRecord): CoachProgramSession {
  return {
    id: toString(row.id),
    program_id: toString(row.program_id),
    week_number: toNumber(row.week_number) ?? 1,
    day_of_week: toNumber(row.day_of_week) ?? 1,
    session_type: toString(row.session_type, "technique") as SessionType,
    duration_min: toNumber(row.duration_min),
    objectives: typeof row.objectives === "string" ? row.objectives : null,
    exercises: toExercises(row.exercises),
    notes: typeof row.notes === "string" ? row.notes : null,
    completed: toBoolean(row.completed),
    completed_session_id: typeof row.completed_session_id === "string" ? row.completed_session_id : null,
  }
}

function mapProgram(row: JsonRecord, sessions: CoachProgramSession[]): CoachTrainingProgram {
  return {
    id: toString(row.id),
    title: toString(row.title, "Programme IA"),
    description: typeof row.description === "string" ? row.description : null,
    duration_weeks: toNumber(row.duration_weeks) ?? 1,
    level: (typeof row.level === "string" ? row.level : null) as PlayerLevel | null,
    is_active: toBoolean(row.is_active),
    created_by_coach: toBoolean(row.created_by_coach),
    coach_id: typeof row.coach_id === "string" ? row.coach_id : null,
    created_at: toString(row.created_at),
    updated_at: toString(row.updated_at),
    sessions,
  }
}

export async function getCoachPageData(): Promise<CoachPageData> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const [
    profileResult,
    matchesResult,
    analysesResult,
    weeklyGoalResult,
    activeProgramResult,
    draftProgramResult,
    pgrProfile,
    pgrRatingHistory,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name, level")
      .eq("id", user.id)
      .single(),
    supabase
      .from("matches")
      .select("id, opponent_name, result, date, source, ranking_match_id, sets_won, sets_lost, match_type, ball_data, score_player, score_opponent")
      .eq("player_id", user.id)
      .order("date", { ascending: false })
      .limit(8),
    supabase
      .from("match_analyses")
      .select("id, match_id, player_id, rating, summary, strengths, weaknesses, critical_moments, recommendations, model_used, created_at")
      .eq("player_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("weekly_goals")
      .select("target_hours, target_sessions, notes")
      .eq("player_id", user.id)
      .eq("week_start", currentWeekStartIso())
      .maybeSingle(),
    supabase
      .from("training_programs")
      .select("id, title, created_at")
      .eq("player_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("training_programs")
      .select("id, title, created_at")
      .eq("player_id", user.id)
      .eq("is_active", false)
      .eq("created_by_coach", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getMyPgrProfileSafe(),
    getMyPgrRatingHistorySafe(20),
  ])

  if (profileResult.error) throw new Error(profileResult.error.message)
  if (matchesResult.error) throw new Error(matchesResult.error.message)
  if (analysesResult.error) {
    console.warn(`[coach] match_analyses unavailable: ${analysesResult.error.message}`)
  }
  if (weeklyGoalResult.error) {
    console.warn(`[coach] weekly_goals unavailable: ${weeklyGoalResult.error.message}`)
  }
  if (activeProgramResult.error) {
    console.warn(`[coach] active program unavailable: ${activeProgramResult.error.message}`)
  }
  if (draftProgramResult.error) {
    console.warn(`[coach] draft program unavailable: ${draftProgramResult.error.message}`)
  }

  const profile = profileResult.data

  return {
    profile: {
      id: profile.id,
      username: profile.username,
      full_name: profile.full_name,
      level: profile.level,
    },
    matches: ((matchesResult.data || []) as JsonRecord[]).map(mapMatch),
    analyses: ((analysesResult.data || []) as JsonRecord[]).map(mapAnalysis),
    weeklyGoal: weeklyGoalResult.data
      ? {
          target_hours: weeklyGoalResult.data.target_hours ?? null,
          target_sessions: weeklyGoalResult.data.target_sessions ?? null,
          notes: weeklyGoalResult.data.notes ?? null,
        }
      : null,
    activeProgram: activeProgramResult.data
      ? {
          id: activeProgramResult.data.id,
          title: activeProgramResult.data.title,
          created_at: activeProgramResult.data.created_at,
        }
      : null,
    draftProgram: draftProgramResult.data
      ? {
          id: draftProgramResult.data.id,
          title: draftProgramResult.data.title,
          created_at: draftProgramResult.data.created_at,
        }
      : null,
    pgrProfile,
    pgrRatingHistory,
    aiConfigured: Boolean(getOpenAiApiKey()),
  }
}

export async function getCoachProgramsData(): Promise<CoachTrainingProgram[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: programs, error: programsError } = await supabase
    .from("training_programs")
    .select("id, title, description, duration_weeks, level, is_active, created_by_coach, coach_id, created_at, updated_at")
    .eq("player_id", user.id)
    .eq("created_by_coach", true)
    .order("created_at", { ascending: false })
    .limit(30)

  if (programsError) throw new Error(programsError.message)

  const programRows = (programs || []) as JsonRecord[]
  const programIds = programRows.map((program) => toString(program.id)).filter(Boolean)

  if (programIds.length === 0) return []

  const { data: sessions, error: sessionsError } = await supabase
    .from("program_sessions")
    .select("id, program_id, week_number, day_of_week, session_type, duration_min, objectives, exercises, notes, completed, completed_session_id")
    .in("program_id", programIds)
    .order("week_number", { ascending: true })
    .order("day_of_week", { ascending: true })

  if (sessionsError) throw new Error(sessionsError.message)

  const sessionsByProgram = new Map<string, CoachProgramSession[]>()
  for (const session of ((sessions || []) as JsonRecord[]).map(mapProgramSession)) {
    const items = sessionsByProgram.get(session.program_id) || []
    items.push(session)
    sessionsByProgram.set(session.program_id, items)
  }

  return programRows.map((program) => {
    const programId = toString(program.id)
    return mapProgram(program, sessionsByProgram.get(programId) || [])
  })
}

export async function getCoachProgramDetail(programId: string): Promise<CoachTrainingProgram> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: program, error: programError } = await supabase
    .from("training_programs")
    .select("id, title, description, duration_weeks, level, is_active, created_by_coach, coach_id, created_at, updated_at")
    .eq("id", programId)
    .eq("player_id", user.id)
    .eq("created_by_coach", true)
    .maybeSingle()

  if (programError) throw new Error(programError.message)
  if (!program) notFound()

  const { data: sessions, error: sessionsError } = await supabase
    .from("program_sessions")
    .select("id, program_id, week_number, day_of_week, session_type, duration_min, objectives, exercises, notes, completed, completed_session_id")
    .eq("program_id", program.id)
    .order("week_number", { ascending: true })
    .order("day_of_week", { ascending: true })

  if (sessionsError) throw new Error(sessionsError.message)

  return mapProgram(program as JsonRecord, ((sessions || []) as JsonRecord[]).map(mapProgramSession))
}
