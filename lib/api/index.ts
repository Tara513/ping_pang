// ============================================================
// Ping Pang Training — API Layer (mock implementation)
// Replace these functions with Supabase calls when ready.
// ============================================================

import type {
  UserProfile, TrainingSession, Exercise, Match, MatchAnalysis,
  EloRating, Equipment, Badge, TrainingProgram, ProRoutine,
  FollowActivity, Location, AIReport, ChatMessage,
  DashboardStats, AggregatedStats, StatsPeriod, ActivityFeedItem,
} from '@/lib/types'

import {
  mockUser, mockSessions, mockMatches, mockAnalyses,
  mockEloRatings, mockEquipments, mockBadges, mockPrograms,
  mockProRoutines, mockFollowActivities, mockLocations,
  mockAIReports, mockChatMessages, mockExercises,
} from '@/lib/mock-data'

// Simulate network delay
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

// ────────────────────────────────────────────────────────────
// User
// ────────────────────────────────────────────────────────────
export async function getUser(): Promise<UserProfile> {
  await delay()
  return mockUser
}

export async function updateUser(data: Partial<UserProfile>): Promise<UserProfile> {
  await delay()
  return { ...mockUser, ...data }
}

// ────────────────────────────────────────────────────────────
// Dashboard
// ────────────────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  await delay()
  const thisWeekSessions = mockSessions.filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo && d <= now
  })
  const thisWeekMatches = mockMatches.filter(m => {
    const d = new Date(m.date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo && d <= now
  })
  const hoursThisWeek = thisWeekSessions.reduce((sum, s) => sum + s.duration, 0) / 60
  const goal = mockUser.weekly_goal

  return {
    hours_this_week: Math.round(hoursThisWeek * 10) / 10,
    sessions_this_week: thisWeekSessions.length,
    matches_this_week: thisWeekMatches.length,
    streak_days: 7,
    weekly_goal: goal,
    sessions_goal_progress: Math.min(100, (thisWeekSessions.length / goal.sessions_per_week) * 100),
    hours_goal_progress: Math.min(100, (hoursThisWeek / goal.hours_per_week) * 100),
  }
}

export async function getActivityFeed(limit = 10): Promise<ActivityFeedItem[]> {
  await delay()
  const sessions: ActivityFeedItem[] = mockSessions.slice(0, 5).map(s => ({
    ...s, feed_type: 'session' as const,
  }))
  const matches: ActivityFeedItem[] = mockMatches.slice(0, 5).map(m => ({
    ...m, feed_type: 'match' as const,
  }))
  return [...sessions, ...matches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

// ────────────────────────────────────────────────────────────
// Sessions
// ────────────────────────────────────────────────────────────
export async function getSessions(): Promise<TrainingSession[]> {
  await delay()
  return [...mockSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getSession(id: string): Promise<TrainingSession | null> {
  await delay()
  return mockSessions.find(s => s.id === id) ?? null
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
  await delay()
  return [...mockMatches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getMatch(id: string): Promise<Match | null> {
  await delay()
  return mockMatches.find(m => m.id === id) ?? null
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
  await delay()
  return mockAnalyses.find(a => a.match_id === matchId) ?? null
}

export async function generateAnalysis(matchId: string): Promise<MatchAnalysis> {
  await delay(3000)
  return {
    id: `analysis-${Date.now()}`,
    match_id: matchId,
    user_id: 'user-1',
    summary: 'Analyse générée par l\'IA. Match solide avec des points forts identifiés et des axes d\'amélioration clairs.',
    strengths: ['Bonne agressivité en premier temps', 'Service efficace'],
    weaknesses: ['Constance en fin de set', 'Gestion du stress'],
    recommendations: ['Travailler les situations de balle décisive', 'Renforcer la régularité sous pression'],
    suggested_exercise_ids: ['ex-13', 'ex-14', 'ex-15'],
    generated_at: new Date().toISOString(),
    status: 'done',
  }
}

// ────────────────────────────────────────────────────────────
// ELO
// ────────────────────────────────────────────────────────────
export async function getEloRatings(): Promise<EloRating[]> {
  await delay()
  return mockEloRatings
}

// ────────────────────────────────────────────────────────────
// Equipment
// ────────────────────────────────────────────────────────────
export async function getEquipments(): Promise<Equipment[]> {
  await delay()
  return mockEquipments
}

export async function getActiveEquipment(): Promise<Equipment | null> {
  await delay()
  return mockEquipments.find(e => e.active) ?? null
}

// ────────────────────────────────────────────────────────────
// Badges
// ────────────────────────────────────────────────────────────
export async function getBadges(): Promise<Badge[]> {
  await delay()
  return mockBadges
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
  await delay(2000)
  return {
    id: `report-${Date.now()}`,
    user_id: 'user-1',
    type: 'weekly',
    period_start: '2025-05-06',
    period_end: '2025-05-12',
    summary: 'Bilan généré par l\'IA pour cette semaine.',
    positives: ['Régularité maintenue', 'Bonne progression ELO'],
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
  await delay()
  const totalMinutes = mockSessions.reduce((sum, s) => sum + s.duration, 0)
  const wins = mockMatches.filter(m => m.result === 'win').length

  return {
    total_hours: Math.round(totalMinutes / 60 * 10) / 10,
    win_rate: Math.round((wins / mockMatches.length) * 100),
    total_sessions: mockSessions.length,
    total_matches: mockMatches.length,
    streak_days: 7,
    hours_per_week: [
      { week: 'S18', hours: 3.5 },
      { week: 'S19', hours: 5.0 },
      { week: 'S20', hours: 2.5 },
      { week: 'S21', hours: 6.0 },
      { week: 'S22', hours: 4.5 },
      { week: 'S23', hours: 5.5 },
      { week: 'S24', hours: 4.0 },
    ],
    session_type_distribution: [
      { type: 'partner', count: 3, label: 'Partenaire' },
      { type: 'multi-balls', count: 1, label: 'Multi-balles' },
      { type: 'match-training', count: 1, label: 'Jeu' },
      { type: 'physical', count: 1, label: 'Physique' },
      { type: 'solo', count: 1, label: 'Solo' },
    ],
    feeling_over_time: mockSessions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(s => ({
        date: s.date,
        feeling: (s.feeling / 5) * 100,
        motivation: s.motivation,
        confidence: s.confidence,
      })),
  }
}
