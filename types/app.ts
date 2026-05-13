import type { Profile, Session, Match, EloRating } from "./database"
import { Flame, Trophy, Zap, Target, TrendingUp, Globe, Users, Star, Award, Dumbbell, type LucideIcon } from "lucide-react"

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
  // Régularité séances
  { type: "first_session",  label: "Premier pas",     emoji: "first_session",  description: "Première séance enregistrée",        color: "#7A9E8E" },
  { type: "sessions_10",    label: "Assidu",           emoji: "sessions_10",    description: "10 séances enregistrées",             color: "#7A9E8E" },
  { type: "sessions_50",    label: "Régulier",         emoji: "sessions_50",    description: "50 séances enregistrées",             color: "#1A5C4A" },
  { type: "centurion",      label: "Centurion",        emoji: "centurion",      description: "100 séances enregistrées",            color: "#E8C840" },
  { type: "on_fire",        label: "En feu",           emoji: "on_fire",        description: "7 séances en 7 jours",                color: "#C72927" },
  { type: "all_types",      label: "Polyvalent",       emoji: "all_types",      description: "Tous les types de séances pratiqués", color: "#1A5C4A" },
  // Matchs
  { type: "first_match",    label: "Compétiteur",      emoji: "first_match",    description: "Premier match enregistré",            color: "#7A9E8E" },
  { type: "first_win",      label: "Première victoire",emoji: "first_win",      description: "Premier match gagné",                 color: "#1A5C4A" },
  { type: "precision",      label: "Précis",           emoji: "precision",      description: "10 matchs gagnés 3-0",                color: "#4A5240" },
  // Social
  { type: "social",         label: "Social",           emoji: "social",         description: "20 joueurs suivis",                   color: "#7A9E8E" },
  // Progression
  { type: "rising",         label: "En progression",   emoji: "rising",         description: "ELO +100 en 30 jours",                color: "#7A9E8E" },
  { type: "speedster",      label: "Speedster",        emoji: "speedster",      description: "Vitesse balle > 100 km/h",            color: "#E8C840" },
  { type: "traveler",       label: "Voyageur",         emoji: "traveler",       description: "Joué dans 5 pays",                    color: "#4A5240" },
  { type: "champion",       label: "Champion",         emoji: "champion",       description: "Gagné un tournoi",                    color: "#E8C840" },
]

export const BADGE_ICONS: Record<string, LucideIcon> = {
  first_session:   Star,
  sessions_10:     Star,
  sessions_50:     Award,
  centurion:       Trophy,
  on_fire:         Flame,
  all_types:       Dumbbell,
  first_match:     Target,
  first_win:       Trophy,
  precision:       Target,
  social:          Users,
  rising:          TrendingUp,
  speedster:       Zap,
  traveler:        Globe,
  champion:        Trophy,
}

export const SESSION_TYPE_COLORS: Record<string, string> = {
  technique:   "#4A5240",
  physique:    "#8A9178",
  match:       "#C72927",
  service:     "#D4C9B5",
  competition: "#1A5C4A",
  chill:       "#2A2A2A",
}

export const SESSION_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  technique:   { fr: "Technique",    en: "Technique" },
  physique:    { fr: "Physique",     en: "Physical" },
  match:       { fr: "Match",        en: "Match" },
  service:     { fr: "Service",      en: "Service" },
  competition: { fr: "Compétition",  en: "Competition" },
  chill:       { fr: "Chill",        en: "Chill" },
}
