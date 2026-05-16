// ============================================================
// Ping Pang Training — API Layer (mock implementation)
// Replace these functions with Supabase calls when ready.
// ============================================================

import type {
  UserProfile, TrainingSession, Exercise, Match, MatchAnalysis,
  Equipment, Badge, TrainingProgram, ProRoutine,
  FollowActivity, Location, AIReport, ChatMessage,
  DashboardStats, AggregatedStats, StatsPeriod, ActivityFeedItem,
  MatchSource,
} from '@/lib/types'

import { createClient } from '@/lib/supabase/client'
import {
  extractSetsFromBallData,
  extractSetsFromScoreArrays,
  isPlainRecord,
} from '@/lib/utils/match-sets'
import {
  mockAnalyses, mockPrograms,
  mockProRoutines, mockFollowActivities, mockLocations,
  mockAIReports, mockChatMessages, mockExercises,
} from '@/lib/mock-data'

// Simulate network delay
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

type SessionRow = {
  id: string
  player_id: string
  date: string
  duration_min: number | null
  session_type: TrainingSession['type']
  location: string | null
  exercises: Array<{ name?: string; notes?: string }> | null
  notes: string | null
  feeling: number | null
  fatigue: number | null
  motivation: number | null
  confidence: number | null
  coach_comment: string | null
  created_at: string
}

type MatchRow = {
  id: string
  player_id: string
  opponent_name: string
  opponent_id?: string | null
  match_type: Match['match_type'] | null
  date: string
  location: string | null
  score_player?: number[] | null
  score_opponent?: number[] | null
  sets_won?: number | null
  sets_lost?: number | null
  result: Match['result'] | null
  notes?: string | null
  ball_data?: unknown
  status?: string | null
  source?: MatchSource | null
  ranking_match_id?: string | null
  visibility?: string | null
  created_at: string
}

type EquipmentRow = {
  id: string
  player_id: string
  blade: string | null
  rubber_fh: string | null
  rubber_bh: string | null
  thickness_fh: number | null
  thickness_bh: number | null
  started_at: string
  is_current: boolean | null
}

type BadgeRow = {
  id: string
  badge_type: string
  earned_at: string
}

async function requireClientUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Non authentifié')
  return { supabase, user }
}

function mapSession(row: SessionRow): TrainingSession {
  const exercises = Array.isArray(row.exercises) ? row.exercises : []

  return {
    id: row.id,
    user_id: row.player_id,
    date: row.date,
    duration: Number(row.duration_min || 0),
    type: row.session_type,
    location: row.location || undefined,
    exercises: exercises.map((exercise: { name?: string; notes?: string }, index: number) => ({
      exercise_id: `${row.id}-${index}`,
      exercise: {
        id: `${row.id}-${index}`,
        name: exercise.name || 'Exercice',
        category: 'regularity',
        description: exercise.notes || '',
        objective: exercise.notes || '',
        duration_estimate: 0,
        recommended_levels: ['beginner', 'intermediate', 'advanced'],
        difficulty: 1,
      } as Exercise,
      duration: 0,
      notes: exercise.notes,
    })),
    notes: row.notes || undefined,
    feeling: (row.feeling || 3) as 1 | 2 | 3 | 4 | 5,
    fatigue: Number(row.fatigue || 0) * 20,
    motivation: Number(row.motivation || 0) * 20,
    confidence: Number(row.confidence || 0) * 20,
    coach_comment: row.coach_comment || undefined,
    created_at: row.created_at,
  }
}

function normalizeMatchSource(source: MatchRow['source']): MatchSource {
  if (source === 'manual' || source === 'import' || source === 'api' || source === 'ranking') return source
  return 'manual'
}

function mapMatch(row: MatchRow): Match {
  const setsFromBallData = extractSetsFromBallData(row.ball_data)
  const setsFromArrays =
    setsFromBallData.length > 0 ? [] : extractSetsFromScoreArrays(row.score_player, row.score_opponent)
  const sets = setsFromBallData.length > 0 ? setsFromBallData : setsFromArrays
  const setsWon = row.sets_won ?? sets.filter((set) => set.player > set.opponent).length
  const setsLost = row.sets_lost ?? sets.filter((set) => set.opponent > set.player).length
  const source = normalizeMatchSource(row.source)

  return {
    id: row.id,
    user_id: row.player_id,
    opponent_name: row.opponent_name,
    opponent_id: row.opponent_id ?? null,
    match_type: row.match_type || (source === 'ranking' ? 'ranking' : 'friendly'),
    date: row.date,
    location: row.location || undefined,
    sets,
    sets_won: setsWon,
    sets_lost: setsLost,
    result: row.result || (setsWon > setsLost ? 'win' : 'loss'),
    source,
    ranking_match_id: row.ranking_match_id ?? null,
    visibility: row.visibility ?? null,
    status: row.status ?? null,
    ball_data: isPlainRecord(row.ball_data) ? row.ball_data : null,
    has_set_details: setsFromBallData.length > 0 || setsFromArrays.length > 0,
    created_at: row.created_at,
  }
}

function mapEquipment(row: EquipmentRow): Equipment {
  return {
    id: row.id,
    user_id: row.player_id,
    blade: { brand: row.blade || '', model: '' },
    forehand_rubber: {
      brand: row.rubber_fh || '',
      model: '',
      thickness: row.thickness_fh ? String(row.thickness_fh) as Equipment['forehand_rubber']['thickness'] : 'max',
    },
    backhand_rubber: {
      brand: row.rubber_bh || '',
      model: '',
      thickness: row.thickness_bh ? String(row.thickness_bh) as Equipment['backhand_rubber']['thickness'] : 'max',
    },
    start_date: row.started_at,
    hours_played: 0,
    active: Boolean(row.is_current),
  }
}

// ────────────────────────────────────────────────────────────
// User
// ────────────────────────────────────────────────────────────
export async function getUser(): Promise<UserProfile> {
  const { supabase, user } = await requireClientUser()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(error.message)

  return {
    id: data.id,
    name: data.full_name || data.username,
    username: data.username,
    email: user.email || '',
    avatar_url: data.avatar_url || undefined,
    country: data.country || 'FR',
    city: data.city || '',
    club: data.club || undefined,
    level: data.level || 'beginner',
    playing_style: data.play_style || 'other',
    dominant_hand: data.dominant_hand || 'right',
    coach_mode: Boolean(data.is_coach),
    weekly_goal: { sessions_per_week: 3, hours_per_week: 5, matches_per_week: 1 },
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
  }
}

export async function updateUser(data: Partial<UserProfile>): Promise<UserProfile> {
  throw new Error(`Mise à jour directe du profil désactivée. Utiliser une server action. ${Object.keys(data).length}`)
}

// ────────────────────────────────────────────────────────────
// Dashboard
// ────────────────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  const { supabase, user } = await requireClientUser()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [{ data: sessions }, { data: matches }, { data: goal }] = await Promise.all([
    supabase.from('sessions').select('*').eq('player_id', user.id).gte('date', weekAgo),
    supabase.from('matches').select('*').eq('player_id', user.id).gte('date', weekAgo),
    supabase
      .from('weekly_goals')
      .select('*')
      .eq('player_id', user.id)
      .gte('week_start', weekAgo)
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])
  const thisWeekSessions = (sessions || []) as SessionRow[]
  const thisWeekMatches = matches || []
  const hoursThisWeek = thisWeekSessions.reduce((sum, session) => sum + Number(session.duration_min || 0), 0) / 60
  const weeklyGoal = {
    sessions_per_week: Number(goal?.target_sessions || 3),
    hours_per_week: Number(goal?.target_hours || 5),
    matches_per_week: 1,
  }

  return {
    hours_this_week: Math.round(hoursThisWeek * 10) / 10,
    sessions_this_week: thisWeekSessions.length,
    matches_this_week: thisWeekMatches.length,
    streak_days: 0,
    weekly_goal: weeklyGoal,
    sessions_goal_progress: Math.min(100, (thisWeekSessions.length / weeklyGoal.sessions_per_week) * 100),
    hours_goal_progress: Math.min(100, (hoursThisWeek / weeklyGoal.hours_per_week) * 100),
  }
}

export async function getActivityFeed(limit = 10): Promise<ActivityFeedItem[]> {
  const { supabase, user } = await requireClientUser()
  const [{ data: sessionRows }, { data: matchRows }] = await Promise.all([
    supabase.from('sessions').select('*').eq('player_id', user.id).order('date', { ascending: false }).limit(limit),
    supabase.from('matches').select('*').eq('player_id', user.id).order('date', { ascending: false }).limit(limit),
  ])
  const sessions: ActivityFeedItem[] = ((sessionRows || []) as SessionRow[]).map((row) => ({
    ...mapSession(row),
    feed_type: 'session' as const,
  }))
  const matches: ActivityFeedItem[] = ((matchRows || []) as MatchRow[]).map((row) => ({
    ...mapMatch(row),
    feed_type: 'match' as const,
  }))
  return [...sessions, ...matches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

// ────────────────────────────────────────────────────────────
// Sessions
// ────────────────────────────────────────────────────────────
export async function getSessions(): Promise<TrainingSession[]> {
  const { supabase, user } = await requireClientUser()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('player_id', user.id)
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return ((data || []) as SessionRow[]).map((row) => mapSession(row))
}

export async function getSession(id: string): Promise<TrainingSession | null> {
  const { supabase, user } = await requireClientUser()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('player_id', user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapSession(data) : null
}

export async function createSession(data: Omit<TrainingSession, 'id' | 'created_at'>): Promise<TrainingSession> {
  await delay(500)
  return {
    ...data,
    id: `session-${Date.now()}`,
    created_at: new Date().toISOString(),
  }
}

// ────────────────────────────────────────────────────────────
// Exercises
// ────────────────────────────────────────────────────────────
export async function getExercises(): Promise<Exercise[]> {
  await delay()
  return mockExercises
}

export async function getExercise(id: string): Promise<Exercise | null> {
  await delay()
  return mockExercises.find(e => e.id === id) ?? null
}

// ────────────────────────────────────────────────────────────
// Matches
// ────────────────────────────────────────────────────────────
export async function getMatches(): Promise<Match[]> {
  const { supabase, user } = await requireClientUser()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('player_id', user.id)
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return ((data || []) as MatchRow[]).map((row) => mapMatch(row))
}

export async function getMatch(id: string): Promise<Match | null> {
  const { supabase, user } = await requireClientUser()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .eq('player_id', user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapMatch(data) : null
}

export async function createMatch(data: Omit<Match, 'id' | 'created_at'>): Promise<Match> {
  await delay(500)
  return {
    ...data,
    id: `match-${Date.now()}`,
    created_at: new Date().toISOString(),
  }
}

// ────────────────────────────────────────────────────────────
// Analysis
// ────────────────────────────────────────────────────────────
export async function getAnalysis(matchId: string): Promise<MatchAnalysis | null> {
  const { supabase, user } = await requireClientUser()
  const { data, error } = await supabase
    .from('match_analyses')
    .select('id, match_id, player_id, rating, summary, strengths, weaknesses, critical_moments, recommendations, model_used, created_at')
    .eq('match_id', matchId)
    .eq('player_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!error && data) {
    return {
      id: data.id,
      match_id: data.match_id,
      user_id: data.player_id,
      rating: typeof data.rating === 'number' ? data.rating : null,
      summary: typeof data.summary === 'string' ? data.summary : 'Analyse enregistrée.',
      strengths: stringArray(data.strengths),
      weaknesses: stringArray(data.weaknesses),
      critical_moments: stringArray(data.critical_moments),
      recommendations: stringArray(data.recommendations),
      model_used: typeof data.model_used === 'string' ? data.model_used : null,
      suggested_exercise_ids: [],
      generated_at: data.created_at,
      status: 'done',
    }
  }

  if (error) console.warn(`[api] match_analyses unavailable: ${error.message}`)
  return mockAnalyses.find(a => a.match_id === matchId) ?? null
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export async function generateAnalysis(matchId: string): Promise<MatchAnalysis> {
  const { user } = await requireClientUser()
  const response = await fetch('/api/analyze-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ match_id: matchId }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(payload?.error || 'Analyse impossible')
  }

  const payload = await response.json() as {
    id?: unknown
    player_id?: unknown
    user_id?: unknown
    rating?: unknown
    summary?: unknown
    strengths?: unknown
    weaknesses?: unknown
    critical_moments?: unknown
    recommendations?: unknown
    model_used?: unknown
    created_at?: unknown
    generated_at?: unknown
  }

  return {
    id: typeof payload.id === 'string' ? payload.id : `analysis-${Date.now()}`,
    match_id: matchId,
    user_id: typeof payload.user_id === 'string' ? payload.user_id : typeof payload.player_id === 'string' ? payload.player_id : user.id,
    rating: typeof payload.rating === 'number' ? payload.rating : null,
    summary: typeof payload.summary === 'string' ? payload.summary : 'Analyse générée.',
    strengths: stringArray(payload.strengths),
    weaknesses: stringArray(payload.weaknesses),
    critical_moments: stringArray(payload.critical_moments),
    recommendations: stringArray(payload.recommendations),
    model_used: typeof payload.model_used === 'string' ? payload.model_used : null,
    suggested_exercise_ids: [],
    generated_at:
      typeof payload.generated_at === 'string'
        ? payload.generated_at
        : typeof payload.created_at === 'string'
        ? payload.created_at
        : new Date().toISOString(),
    status: 'done',
  }
}

// Equipment
// ────────────────────────────────────────────────────────────
export async function getEquipments(): Promise<Equipment[]> {
  const { supabase, user } = await requireClientUser()
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('player_id', user.id)
    .order('started_at', { ascending: false })

  if (error) throw new Error(error.message)
  return ((data || []) as EquipmentRow[]).map((row) => mapEquipment(row))
}

export async function getActiveEquipment(): Promise<Equipment | null> {
  const { supabase, user } = await requireClientUser()
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('player_id', user.id)
    .eq('is_current', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapEquipment(data) : null
}

// ────────────────────────────────────────────────────────────
// Badges
// ────────────────────────────────────────────────────────────
export async function getBadges(): Promise<Badge[]> {
  const { supabase, user } = await requireClientUser()
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('player_id', user.id)
    .order('earned_at', { ascending: false })

  if (error) throw new Error(error.message)
  return ((data || []) as BadgeRow[]).map((badge) => ({
    id: badge.id,
    name: String(badge.badge_type || '').replaceAll('_', ' '),
    description: '',
    icon: '★',
    category: 'progression',
    unlocked: true,
    unlocked_at: badge.earned_at,
  }))
}

// ────────────────────────────────────────────────────────────
// Programs
// ────────────────────────────────────────────────────────────
export async function getPrograms(): Promise<TrainingProgram[]> {
  await delay()
  return mockPrograms
}

export async function getProgram(id: string): Promise<TrainingProgram | null> {
  await delay()
  return mockPrograms.find(p => p.id === id) ?? null
}

// ────────────────────────────────────────────────────────────
// AI Reports
// ────────────────────────────────────────────────────────────
export async function getAIReports(): Promise<AIReport[]> {
  await delay()
  return mockAIReports
}

export async function generateWeeklyReport(): Promise<AIReport> {
  const { user } = await requireClientUser()
  await delay(2000)
  return {
    id: `report-${Date.now()}`,
    user_id: user.id,
    type: 'weekly',
    period_start: '2025-05-06',
    period_end: '2025-05-12',
    summary: 'Bilan généré par l\'IA pour cette semaine.',
    positives: ['Régularité maintenue', 'Bonne progression ranking'],
    improvements: ['Volume de matchs en dessous de l\'objectif'],
    generated_at: new Date().toISOString(),
  }
}

// ────────────────────────────────────────────────────────────
// Chat
// ────────────────────────────────────────────────────────────
export async function getChatHistory(): Promise<ChatMessage[]> {
  await delay()
  return mockChatMessages
}

export async function sendChatMessage(content: string): Promise<ChatMessage> {
  await delay(1200)
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: `Bonne question ! En analysant ton profil et tes données récentes, voici ce que je peux te dire : ${content.length > 20 ? 'Je prends en compte tes dernières séances et résultats pour te donner une réponse personnalisée.' : 'Donne-moi plus de détails pour affiner ma réponse.'}`,
    timestamp: new Date().toISOString(),
  }
}

// ────────────────────────────────────────────────────────────
// Social
// ────────────────────────────────────────────────────────────
export async function getFollowActivities(): Promise<FollowActivity[]> {
  await delay()
  return mockFollowActivities
}

// ────────────────────────────────────────────────────────────
// Pro Routines
// ────────────────────────────────────────────────────────────
export async function getProRoutines(): Promise<ProRoutine[]> {
  await delay()
  return mockProRoutines
}

// ────────────────────────────────────────────────────────────
// Locations
// ────────────────────────────────────────────────────────────
export async function getLocations(): Promise<Location[]> {
  await delay()
  return mockLocations
}

// ────────────────────────────────────────────────────────────
// Stats
// ────────────────────────────────────────────────────────────
export async function getAggregatedStats(_period: StatsPeriod = 'all'): Promise<AggregatedStats> {
  void _period
  const { supabase, user } = await requireClientUser()
  const [{ data: sessions, error: sessionsError }, { data: matches, error: matchesError }] = await Promise.all([
    supabase.from('sessions').select('*').eq('player_id', user.id).order('date', { ascending: true }),
    supabase.from('matches').select('*').eq('player_id', user.id),
  ])

  if (sessionsError) throw new Error(sessionsError.message)
  if (matchesError) throw new Error(matchesError.message)

  const sessionRows = (sessions || []) as SessionRow[]
  const matchRows = (matches || []) as MatchRow[]
  const totalMinutes = sessionRows.reduce((sum, session) => sum + Number(session.duration_min || 0), 0)
  const wins = matchRows.filter((match) => match.result === 'win').length
  const typeCounts = sessionRows.reduce((acc: Record<string, number>, session) => {
    const type = String(session.session_type || 'technique')
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
  const weeklyHours = sessionRows.reduce((acc: Record<string, number>, session) => {
    const week = session.date.slice(0, 7)
    acc[week] = (acc[week] || 0) + Number(session.duration_min || 0) / 60
    return acc
  }, {})

  return {
    total_hours: Math.round(totalMinutes / 60 * 10) / 10,
    win_rate: matchRows.length ? Math.round((wins / matchRows.length) * 100) : 0,
    total_sessions: sessionRows.length,
    total_matches: matchRows.length,
    streak_days: 0,
    hours_per_week: Object.entries(weeklyHours).map(([week, hours]) => ({
      week,
      hours: Math.round(hours * 10) / 10,
    })),
    session_type_distribution: Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      label: type,
    })),
    feeling_over_time: sessionRows
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((session) => ({
        date: session.date,
        feeling: Number(session.feeling || 0) * 20,
        motivation: Number(session.motivation || 0) * 20,
        confidence: Number(session.confidence || 0) * 20,
      })),
  }
}
