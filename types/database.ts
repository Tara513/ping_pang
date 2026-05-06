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
export type MatchType = "friendly" | "league" | "tournament" | "training"
export type MatchResult = "win" | "loss"
export type Federation = "FFTT" | "RFETM" | "DTTB" | "ETTU" | "ITTF" | "custom"

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
  opponent_id: string | null
  result: MatchResult | null
  score_player: number[]
  score_opponent: number[]
  sets_won: number | null
  sets_lost: number | null
  match_type: MatchType
  date: string
  location: string | null
  location_lat: number | null
  location_lng: number | null
  notes: string | null
  ball_data: BallData | null
  created_at: string
}

export interface BallDataSet {
  set_number: number
  avg_speed: number
  max_speed: number
  avg_spin: number
  rallies: number
}

export interface BallData {
  match_id: string
  recorded_at: string
  summary: {
    avg_speed_kmh: number
    max_speed_kmh: number
    avg_spin_rpm: number
    max_spin_rpm: number
    total_rallies: number
    avg_rally_length: number
    longest_rally: number
    serve_accuracy_pct: number
    topspin_count: number
    backspin_count: number
    sidespin_count: number
    flat_hit_count: number
  }
  by_set: BallDataSet[]
}

export interface EloRating {
  id: string
  player_id: string
  federation: Federation
  elo: number
  rank_points: number
  updated_at: string
}

export interface EloHistory {
  id: string
  player_id: string
  federation: Federation
  elo_before: number
  elo_after: number
  delta: number
  match_id: string | null
  recorded_at: string
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
  updated_at: string
}

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at"> & { created_at?: string }
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
      elo_ratings: {
        Row: EloRating
        Insert: Omit<EloRating, "id" | "updated_at"> & { id?: string; updated_at?: string }
        Update: Partial<Omit<EloRating, "id">>
      }
      elo_history: {
        Row: EloHistory
        Insert: Omit<EloHistory, "id" | "recorded_at"> & { id?: string; recorded_at?: string }
        Update: Partial<Omit<EloHistory, "id">>
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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
