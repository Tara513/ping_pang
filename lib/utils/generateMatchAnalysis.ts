import type { Match } from "@/types/database"
import type { MatchAnalysis } from "@/types/app"

const STRENGTHS_POOL = [
  "Excellente constance sur le coup droit croisé",
  "Gestion mentale remarquable sur les moments décisifs",
  "Service varié qui a mis en difficulté l'adversaire",
  "Très bon taux de réussite en retour de service",
  "Jeu de jambes efficace et placement optimal",
  "Accélération en milieu d'échange bien maîtrisée",
  "Bonne lecture du jeu adverse dès le 3ème set",
  "Résistance physique sur la durée du match",
]

const WEAKNESSES_POOL = [
  "Taux d'erreurs élevé sur le revers en milieu de table",
  "Services trop prévisibles en deuxième mi-temps",
  "Précipitation dans les attaques en faveur",
  "Gestion du score difficile sur les balles décisives",
  "Relâchement notable en début de set suivant une victoire",
  "Peu d'adaptation tactique face à la défensive adverse",
  "Coups droits à pleine balle trop souvent dans le filet",
]

const RECOMMENDATIONS_POOL = [
  "Travailler les échanges revers-revers en multiball pendant 2 séances",
  "Développer 2-3 nouvelles combinaisons de services",
  "Inclure des exercices de jeu en faveur dans tes prochaines séances",
  "Pratiquer des matchs d'entraînement en mode compétition pour la gestion du stress",
  "Renforcer le footwork sur les séances physiques (ladder drill)",
  "Analyser les vidéos de tes matchs pour identifier les patterns adverses",
]

export function generateMatchAnalysis(match: Partial<Match>): MatchAnalysis {
  const isWin = match.result === "win"
  const setsWon = match.sets_won || 0
  const setsLost = match.sets_lost || 0
  const setDiff = setsWon - setsLost

  const baseRating = isWin
    ? setDiff >= 2 ? 78 + Math.round(Math.random() * 15)
    : 65 + Math.round(Math.random() * 15)
    : setDiff <= -2 ? 35 + Math.round(Math.random() * 15)
    : 52 + Math.round(Math.random() * 15)

  const strengths = shuffle(STRENGTHS_POOL).slice(0, 3)
  const weaknesses = shuffle(WEAKNESSES_POOL).slice(0, isWin ? 2 : 3)
  const recommendations = shuffle(RECOMMENDATIONS_POOL).slice(0, 3)

  const totalSets = (match.score_player?.length || 3)
  const critical_moments = Array.from({ length: Math.min(totalSets, 3) }, (_, i) => ({
    set: i + 1,
    description: isWin
      ? i === 0 ? `Prise de confiance décisive au set ${i + 1}`
      : i === 1 ? `Excellente remontée après une pause stratégique`
      : `Maîtrise totale dans le money time`
      : i === 0 ? `Entrée dans le match difficile face au service adverse`
      : i === 1 ? `Opportunité manquée de reprendre l'avantage`
      : `Fin de match sous pression`,
    impact: (isWin ? i % 3 !== 1 : i % 3 === 1) ? "positive" as const : "negative" as const,
  }))

  return {
    overall_rating: baseRating,
    strengths,
    weaknesses,
    critical_moments,
    recommendations,
    comparison_vs_previous: isWin
      ? "Performance en hausse par rapport à tes 3 derniers matchs. Continue sur cette lancée !"
      : "Match difficile, mais des points positifs à retenir. Concentre-toi sur les recommandations.",
  }
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}
