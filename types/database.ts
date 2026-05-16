export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PlayStyle = "attacker" | "defender" | "allround" | "penhold" | "other"
export type DominantHand = "right" | "left"
export type PlayerLevel = "beginner" | "intermediate" | "advanced" | "competitive" | "elite"
export type SessionType = "technique" | "physique" | "match" | "service" | "competition" | "chill"
export type MatchType = "friendly" | "league" | "tournament" | "training" | "ranking"
export type MatchResult = "win" | "loss"
export type Federation = "FFTT" | "RFETM" | "DTTB" | "ETTU" | "ITTF" | "custom"
export type RecapType = "week" | "season"
export type MatchSource = "manual" | "import" | "api" | "ranking"

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  country: string
  city: string | null
  club: string | null
  play_style: PlayStyle | null
  dominant_hand: DominantHand | null
  level: PlayerLevel | null
  is_coach: boolean
  created_at: string
  updated_at: string
  onboarding_completed: boolean
}

export interface Equipment {
  id: string
  player_id: string
  blade: string | null
  rubber_fh: string | null
  rubber_bh: string | null
  thickness_fh: number | null
  thickness_bh: number | null
  is_current: boolean
  started_at: string
  ended_at: string | null
  notes: string | null
}

export interface Exercise {
  name: string
  duration?: number
  sets?: number
  reps?: number
  notes?: string
}

export interface Session {
  id: string
  player_id: string
  session_type: SessionType
  duration_min: number
  date: string
  location: string | null
  location_lat: number | null
  location_lng: number | null
  notes: string | null
  exercises: Exercise[]
  feeling: number | null
  fatigue: number | null
  motivation: number | null
  confidence: number | null
  has_description: boolean
  coach_comment: string | null
  created_at: string
}

export interface Match {
  id: string
  player_id: string
  opponent_name: string
  opponent_id?: string | null
  result: MatchResult | null
  score_player?: number[] | null
  score_opponent?: number[] | null
  sets_won: number | null
  sets_lost: number | null
  match_type: MatchType | null
  date: string
  location: string | null
  location_lat: number | null
  location_lng: number | null
  notes: string | null
  ball_data: BallData | null
  status?: string | null
  source?: MatchSource | null
  ranking_match_id?: string | null
  visibility?: string | null
  created_at: string
}

export interface BallDataSet {
  set_number?: number
  avg_speed?: number
  max_speed?: number
  avg_spin?: number
  rallies?: number
  [key: string]: Json | undefined
}

export interface BallData {
  match_id?: string
  recorded_at?: string
  summary?: {
    [key: string]: Json | undefined
  }
  by_set?: BallDataSet[]
  sets_detail?: Json[]
  [key: string]: Json | undefined
}

export interface PgrProfile {
  player_id: string | null
  display_name: string | null
  first_name: string | null
  last_name: string | null
  country_code: string | null
  gender: string | null
  category: string | null
  club_name: string | null
  club_city: string | null
  rating: number | null
  rating_deviation: number | null
  volatility: number | null
  match_count: number | null
  confidence_status: string | null
  is_provisional: boolean | null
  initialization_source: string | null
  snapshot_date: string | null
  last_external_source: string | null
  last_external_rank: number | null
  last_external_value: number | null
  last_external_date: string | null
  [key: string]: Json | undefined
}

export interface PgrRatingHistoryPoint {
  date?: string | null
  recorded_at?: string | null
  rating?: number | null
  rating_before?: number | null
  rating_after?: number | null
  delta?: number | null
  match_id?: string | null
  [key: string]: Json | undefined
}

export interface PgrMatch {
  match_id?: string | null
  pgr_match_id?: string | null
  training_match_id?: string | null
  opponent_name?: string | null
  result?: MatchResult | null
  validation_status?: string | null
  date?: string | null
  played_at?: string | null
  rating_delta?: number | null
  [key: string]: Json | undefined
}

export interface PgrLeaderboardEntry {
  player_id?: string | null
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  country_code?: string | null
  gender?: string | null
  category?: string | null
  rating?: number | null
  rank?: number | null
  match_count?: number | null
  confidence_status?: string | null
  [key: string]: Json | undefined
}

export interface WeeklyGoal {
  id: string
  player_id: string
  week_start: string
  target_hours: number | null
  target_sessions: number | null
  notes: string | null
  achieved: boolean
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Badge {
  id: string
  player_id: string
  badge_type: string
  earned_at: string
  metadata: Json
}

export interface ProPlayer {
  id: string
  full_name: string
  country: string | null
  ittf_ranking: number | null
  ittf_points: number | null
  play_style: string | null
  birth_year: number | null
  club: string | null
  equipment: Json | null
  bio: string | null
  image_url: string | null
  routine: ProRoutineDay[] | null
  updated_at: string
}

export interface ProRoutineDay {
  day: string
  focus: string
  duration_min: number
  exercises: string[]
  notes?: string
}

// ── Training programs ──────────────────────────────────────────────────────

export interface TrainingProgram {
  id: string
  player_id: string
  title: string
  description: string | null
  duration_weeks: number
  level: PlayerLevel | null
  is_active: boolean
  created_by_coach: boolean
  coach_id: string | null
  created_at: string
  updated_at: string
}

export interface ProgramSession {
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

// ── AI Recaps ──────────────────────────────────────────────────────────────

export interface RecapContent {
  resume: string
  points_forts: string[]
  points_amelioration: string[]
  recommandations: string[]
  objectif_prochain: string
  score_global: number
}

export interface Recap {
  id: string
  player_id: string
  type: RecapType
  period_start: string
  period_end: string
  content: RecapContent
  sessions_count: number
  matches_count: number
  total_hours: number
  created_at: string
}

// ── Analysis chats ─────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface AnalysisChat {
  id: string
  player_id: string
  match_id: string | null
  session_id: string | null
  title: string | null
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

export interface MatchAnalysis {
  id: string
  match_id: string
  player_id: string
  rating: number | null
  summary: string | null
  strengths: Json | null
  weaknesses: Json | null
  critical_moments: Json | null
  recommendations: Json | null
  model_used: string | null
  created_at: string
}

// ── Supabase Database type ─────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at" | "updated_at" | "onboarding_completed"> & {
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
        }
        Update: Partial<Omit<Profile, "id">>
      }
      equipment: {
        Row: Equipment
        Insert: Omit<Equipment, "id"> & { id?: string }
        Update: Partial<Omit<Equipment, "id">>
      }
      sessions: {
        Row: Session
        Insert: Omit<Session, "id" | "created_at"> & { id?: string; created_at?: string }
        Update: Partial<Omit<Session, "id">>
      }
      matches: {
        Row: Match
        Insert: Omit<Match, "id" | "created_at"> & { id?: string; created_at?: string }
        Update: Partial<Omit<Match, "id">>
      }
      weekly_goals: {
        Row: WeeklyGoal
        Insert: Omit<WeeklyGoal, "id"> & { id?: string }
        Update: Partial<Omit<WeeklyGoal, "id">>
      }
      follows: {
        Row: Follow
        Insert: Follow
        Update: Partial<Follow>
      }
      badges: {
        Row: Badge
        Insert: Omit<Badge, "id" | "earned_at"> & { id?: string; earned_at?: string }
        Update: Partial<Omit<Badge, "id">>
      }
      pro_players: {
        Row: ProPlayer
        Insert: Omit<ProPlayer, "id" | "updated_at"> & { id?: string; updated_at?: string }
        Update: Partial<Omit<ProPlayer, "id">>
      }
      training_programs: {
        Row: TrainingProgram
        Insert: Omit<TrainingProgram, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<TrainingProgram, "id">>
      }
      program_sessions: {
        Row: ProgramSession
        Insert: Omit<ProgramSession, "id"> & { id?: string }
        Update: Partial<Omit<ProgramSession, "id">>
      }
      recaps: {
        Row: Recap
        Insert: Omit<Recap, "id" | "created_at"> & { id?: string; created_at?: string }
        Update: Partial<Omit<Recap, "id">>
      }
      analysis_chats: {
        Row: AnalysisChat
        Insert: Omit<AnalysisChat, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<AnalysisChat, "id">>
      }
      match_analyses: {
        Row: MatchAnalysis
        Insert: Omit<MatchAnalysis, "id" | "created_at"> & { id?: string; created_at?: string }
        Update: Partial<Omit<MatchAnalysis, "id">>
      }
    }
    Views: Record<string, never>
    Functions: {
      check_and_award_badges: {
        Args: { p_player_id: string }
        Returns: void
      }
      get_pgr_leaderboard: {
        Args: { p_limit?: number; p_country_code?: string | null; p_gender?: string | null }
        Returns: PgrLeaderboardEntry[]
      }
      get_my_pgr_profile: {
        Args: Record<string, never>
        Returns: PgrProfile[]
      }
      get_my_pgr_matches: {
        Args: { p_limit?: number; p_validation_status?: string | null }
        Returns: PgrMatch[]
      }
      get_my_pgr_rating_history: {
        Args: { p_limit?: number }
        Returns: PgrRatingHistoryPoint[]
      }
      claim_pgr_player: {
        Args: { p_pgr_player_id: string }
        Returns: PgrProfile | null
      }
      unclaim_pgr_player: {
        Args: Record<string, never>
        Returns: PgrProfile | null
      }
    }
    Enums: Record<string, never>
  }
}
