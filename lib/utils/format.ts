import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date: string | Date, pattern = 'd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: fr })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return "Aujourd'hui"
  if (isYesterday(d)) return 'Hier'
  return format(d, 'd MMM', { locale: fr })
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: fr })
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
}

export function formatHours(minutes: number): string {
  return (minutes / 60).toFixed(1) + 'h'
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatElo(rating: number): string {
  return rating.toLocaleString('fr-FR')
}

export function formatScore(sets: { player: number; opponent: number }[]): string {
  return sets.map(s => `${s.player}-${s.opponent}`).join(', ')
}

export function formatSetsResult(sets: { player: number; opponent: number }[]): string {
  const playerSets = sets.filter(s => s.player > s.opponent).length
  const opponentSets = sets.filter(s => s.opponent > s.player).length
  return `${playerSets}/${opponentSets}`
}

export const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  competitive: 'Compétiteur',
  elite: 'Élite',
  expert: 'Expert',
  pro: 'Pro',
}

export const STYLE_LABELS: Record<string, string> = {
  attacker: 'Attaquant',
  allround: 'Polyvalent',
  'all-round': 'Polyvalent',
  defender: 'Défenseur',
  penhold: 'Prise porte-plume',
  other: 'Autre',
  blocker: 'Bloqueur',
  'offensive-defender': 'Défenseur offensif',
}

export const SESSION_TYPE_LABELS: Record<string, string> = {
  technique: 'Technique',
  physique: 'Physique',
  match: 'Match',
  service: 'Service',
  competition: 'Compétition',
  chill: 'Libre',
  solo: 'Solo',
  'multi-balls': 'Multi-balles',
  partner: 'Partenaire',
  'match-training': 'Jeu',
  physical: 'Physique',
  mental: 'Mental',
}

export const EXERCISE_CATEGORY_LABELS: Record<string, string> = {
  service: 'Service',
  return: 'Remise',
  topspin: 'Top spin',
  block: 'Bloc',
  footwork: 'Déplacement',
  regularity: 'Régularité',
  mental: 'Mental',
  physical: 'Physique',
}

export const FEELING_EMOJIS: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

export const FEDERATION_LABELS: Record<string, string> = {
  FFTT: 'Fédération Française (FFTT)',
  RFETM: 'Fédération espagnole (RFETM)',
  DTTB: 'Fédération allemande (DTTB)',
  ETTU: 'Europe (ETTU)',
  WTT: 'World Table Tennis',
  TTR: 'Table Tennis Rating',
  PGR: 'Pro Global Ranking',
  ITTF: 'ITTF World Ranking',
  custom: 'ELO personnalisé',
}
