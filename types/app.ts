import type { Profile, Session, Match, EloRating } from "./database"
import { Flame, Trophy, Zap, Target, TrendingUp, Globe, Users, type LucideIcon } from "lucide-react"

export interface SessionWithProfile extends Session {
  profiles?: Profile
}

export interface MatchWithProfile extends Match {
  profiles?: Profile
  opponent?: Profile
}

export interface ProfileWithStats extends Profile {
  stats?: {
    total_sessions: number
    total_matches: number
    total_hours: number
    win_rate: number
    current_streak: number
  }
  elo_ratings?: EloRating[]
  is_following?: boolean
  follower_count?: number
  following_count?: number
}

export interface FeedItem {
  id: string
  type: "session" | "match"
  data: Session | Match
  profile: Profile
  created_at: string
}

export interface MatchAnalysis {
  overall_rating: number
  strengths: string[]
  weaknesses: string[]
  critical_moments: Array<{
    set: number
    description: string
    impact: "positive" | "negative"
  }>
  recommendations: string[]
  comparison_vs_previous: string
}

export interface BadgeDefinition {
  type: string
  label: string
  emoji: string
  description: string
  color: string
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { type: "on_fire", label: "En feu", emoji: "on_fire", description: "7 jours consécutifs de jeu", color: "#C8352A" },
  { type: "centurion", label: "Centurion", emoji: "centurion", description: "100 séances enregistrées", color: "#E8C840" },
  { type: "speedster", label: "Speedster", emoji: "speedster", description: "Vitesse balle > 100 km/h", color: "#E8C840" },
  { type: "precision", label: "Précis", emoji: "precision", description: "10 matchs 3-0", color: "#4A5240" },
  { type: "rising", label: "En progression", emoji: "rising", description: "ELO +100 en 30 jours", color: "#8A9178" },
  { type: "traveler", label: "Voyageur", emoji: "traveler", description: "Joué dans 5 pays", color: "#4A5240" },
  { type: "champion", label: "Champion", emoji: "champion", description: "Gagné un tournoi", color: "#E8C840" },
  { type: "social", label: "Social", emoji: "social", description: "20 joueurs suivis", color: "#8A9178" },
]

export const BADGE_ICONS: Record<string, LucideIcon> = {
  on_fire: Flame,
  centurion: Trophy,
  speedster: Zap,
  precision: Target,
  rising: TrendingUp,
  traveler: Globe,
  champion: Trophy,
  social: Users,
}

export const SESSION_TYPE_COLORS: Record<string, string> = {
  technique: "#4A5240",
  physique: "#8A9178",
  match: "#C8352A",
  service: "#E8C840",
  competition: "#E8C840",
  chill: "#2A2A2A",
}

export const SESSION_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  technique: { fr: "Technique", en: "Technique" },
  physique: { fr: "Physique", en: "Physical" },
  match: { fr: "Match", en: "Match" },
  service: { fr: "Service", en: "Service" },
  competition: { fr: "Compétition", en: "Competition" },
  chill: { fr: "Chill", en: "Chill" },
}
