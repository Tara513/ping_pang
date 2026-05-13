// ============================================================
// Ping Pang Training — TypeScript Types
// ============================================================

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'pro'
export type PlayingStyle = 'attacker' | 'all-round' | 'defender' | 'blocker' | 'offensive-defender'
export type DominantHand = 'left' | 'right'
export type SessionType = 'solo' | 'multi-balls' | 'partner' | 'match-training' | 'physical' | 'mental'
export type ExerciseCategory = 'service' | 'return' | 'topspin' | 'block' | 'footwork' | 'regularity' | 'mental' | 'physical'
export type MatchType = 'friendly' | 'tournament' | 'ranking' | 'training'
export type MatchResult = 'win' | 'loss'
export type Federation = 'FFTT' | 'WTT' | 'TTR' | 'PGR' | 'ITTF'
export type BadgeCategory = 'regularity' | 'volume' | 'matches' | 'progression'
export type RubberThickness = '1.5' | '1.8' | '2.0' | '2.1' | 'max'
export type ConfidenceLevel = 'low' | 'medium' | 'high'
export type ProgramStatus = 'active' | 'completed' | 'archived'
export type AnalysisStatus = 'pending' | 'generating' | 'done' | 'error'
export type AIReportType = 'weekly' | 'season'
export type ChatRole = 'user' | 'assistant'
export type StatsPeriod = '7d' | '30d' | '6m' | 'all'

// ────────────────────────────────────────────────────────────
// WeeklyGoal
// ────────────────────────────────────────────────────────────
export interface WeeklyGoal {
  sessions_per_week: number
  hours_per_week: number
  matches_per_week: number
}

// ────────────────────────────────────────────────────────────
// Equipment
// ────────────────────────────────────────────────────────────
export interface EquipmentItem {
  brand: string
  model: string
}

export interface RubberItem extends EquipmentItem {
  thickness: RubberThickness
}

export interface Equipment {
  id: string
  user_id: string
  blade: EquipmentItem
  forehand_rubber: RubberItem
  backhand_rubber: RubberItem
  start_date: string
  hours_played: number
  active: boolean
}

// ────────────────────────────────────────────────────────────
// UserProfile
// ────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  avatar_url?: string
  country: string
  city: string
  club?: string
  level: Level
  playing_style: PlayingStyle
  dominant_hand: DominantHand
  coach_mode: boolean
  weekly_goal: WeeklyGoal
  current_equipment_id?: string
  created_at: string
  updated_at: string
}

// ────────────────────────────────────────────────────────────
// Exercise
// ────────────────────────────────────────────────────────────
export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  description: string
  objective: string
  duration_estimate: number
  recommended_levels: Level[]
  difficulty: 1 | 2 | 3 | 4 | 5
}

export interface SessionExercise {
  exercise_id: string
  exercise: Exercise
  duration: number
  notes?: string
}

// ────────────────────────────────────────────────────────────
// TrainingSession
// ────────────────────────────────────────────────────────────
export interface TrainingSession {
  id: string
  user_id: string
  date: string
  duration: number
  type: SessionType
  location?: string
  exercises: SessionExercise[]
  notes?: string
  feeling: 1 | 2 | 3 | 4 | 5
  fatigue: number
  motivation: number
  confidence: number
  coach_comment?: string
  created_at: string
}

// ────────────────────────────────────────────────────────────
// Match
// ────────────────────────────────────────────────────────────
export interface SetScore {
  player: number
  opponent: number
}

export interface Match {
  id: string
  user_id: string
  opponent_name: string
  opponent_level?: Level
  match_type: MatchType
  date: string
  location?: string
  sets: SetScore[]
  result: MatchResult
  source: 'manual' | 'ranking-import'
  analysis_id?: string
  created_at: string
}

// ────────────────────────────────────────────────────────────
// MatchAnalysis
// ────────────────────────────────────────────────────────────
export interface MatchAnalysis {
  id: string
  match_id: string
  user_id: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  suggested_exercise_ids: string[]
  generated_at: string
  status: AnalysisStatus
}

// ────────────────────────────────────────────────────────────
// EloRating
// ────────────────────────────────────────────────────────────
export interface EloHistoryPoint {
  date: string
  rating: number
  delta?: number
  match_id?: string
}

export interface EloRating {
  id: string
  user_id: string
  federation: Federation
  rating: number
  percentile?: number
  confidence: ConfidenceLevel
  history: EloHistoryPoint[]
  last_updated: string
}

// ────────────────────────────────────────────────────────────
// Badge
// ────────────────────────────────────────────────────────────
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  unlocked: boolean
  unlocked_at?: string
  progress?: number
  target_label?: string
}

// ────────────────────────────────────────────────────────────
// TrainingProgram
// ────────────────────────────────────────────────────────────
export interface ProgramSession {
  id: string
  name: string
  exercise_ids: string[]
  completed: boolean
  scheduled_date?: string
}

export interface TrainingProgram {
  id: string
  user_id: string
  name: string
  description: string
  sessions: ProgramSession[]
  status: ProgramStatus
  ai_generated: boolean
  created_at: string
  progress: number
}

// ────────────────────────────────────────────────────────────
// ProRoutine
// ────────────────────────────────────────────────────────────
export interface ProRoutine {
  id: string
  player_name: string
  player_country: string
  player_rank?: number
  description: string
  equipment: {
    blade: string
    forehand_rubber: string
    backhand_rubber: string
  }
  favorite_exercise_ids: string[]
  training_hours_per_week: number
  tips: string[]
  video_label?: string
}

// ────────────────────────────────────────────────────────────
// Social
// ────────────────────────────────────────────────────────────
export interface FollowedUser {
  id: string
  username: string
  name: string
  avatar_url?: string
  club?: string
  level: Level
}

export interface FollowActivity {
  id: string
  user: FollowedUser
  activity_type: 'session' | 'match'
  activity_id: string
  activity_summary: string
  date: string
  public: boolean
}

// ────────────────────────────────────────────────────────────
// Location
// ────────────────────────────────────────────────────────────
export interface Location {
  id: string
  name: string
  address: string
  city: string
  country: string
  coordinates: { lat: number; lng: number }
  club_name?: string
  tables_count?: number
  hours?: string
  sessions_count: number
  matches_count: number
}

// ────────────────────────────────────────────────────────────
// AIReport
// ────────────────────────────────────────────────────────────
export interface AIReport {
  id: string
  user_id: string
  type: AIReportType
  period_start: string
  period_end: string
  summary: string
  positives: string[]
  improvements: string[]
  recommended_program?: string
  generated_at: string
}

// ────────────────────────────────────────────────────────────
// Chat
// ────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: string
}

// ────────────────────────────────────────────────────────────
// Dashboard / Feed
// ────────────────────────────────────────────────────────────
export type ActivityFeedItem =
  | (TrainingSession & { feed_type: 'session' })
  | (Match & { feed_type: 'match' })

export interface DashboardStats {
  hours_this_week: number
  sessions_this_week: number
  matches_this_week: number
  streak_days: number
  weekly_goal: WeeklyGoal
  sessions_goal_progress: number
  hours_goal_progress: number
}

// ────────────────────────────────────────────────────────────
// Stats (aggregated)
// ────────────────────────────────────────────────────────────
export interface AggregatedStats {
  total_hours: number
  win_rate: number
  total_sessions: number
  total_matches: number
  streak_days: number
  hours_per_week: { week: string; hours: number }[]
  session_type_distribution: { type: string; count: number; label: string }[]
  feeling_over_time: { date: string; feeling: number; motivation: number; confidence: number }[]
}
