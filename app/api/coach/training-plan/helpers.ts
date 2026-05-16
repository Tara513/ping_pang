import { createOpenAiChatCompletion, getAiNotConfiguredPayload } from "@/lib/ai/config"
import { getMyPgrProfileSafe, getMyPgrRatingHistorySafe } from "@/lib/data/pgr"
import { createClient } from "@/lib/supabase/server"
import {
  extractSetsFromBallData,
  extractSetsFromScoreArrays,
  formatSetsForPrompt,
} from "@/lib/utils/match-sets"
import {
  generatedPlanSchema,
  type GeneratedTrainingPlan,
  type PlanIntensity,
} from "./schema"
import type { PgrProfile, PgrRatingHistoryPoint } from "@/types/database"

type JsonRecord = Record<string, unknown>
type GeneratedPlanSession = GeneratedTrainingPlan["sessions"][number]
type SessionType = GeneratedPlanSession["session_type"]

const sessionTypes = ["technique", "physique", "match", "service", "competition", "chill"] as const

export class TrainingPlanGenerationError extends Error {
  constructor(
    public readonly reason: string,
    public readonly rawResponse?: string,
    public readonly validationIssues?: unknown
  ) {
    super(reason)
    this.name = "TrainingPlanGenerationError"
  }
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function compactText(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

function compactNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number.parseInt(value.replace(/[^\d-]/g, ""), 10)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getMatchSetsText(match: JsonRecord) {
  const setsFromBallData = extractSetsFromBallData(match.ball_data)
  const fallbackSets =
    setsFromBallData.length > 0 ? [] : extractSetsFromScoreArrays(match.score_player, match.score_opponent)
  return formatSetsForPrompt(setsFromBallData.length > 0 ? setsFromBallData : fallbackSets)
}

function currentWeekStartIso() {
  const weekStart = new Date()
  const day = weekStart.getDay()
  weekStart.setDate(weekStart.getDate() + (day === 0 ? -6 : 1 - day))
  return weekStart.toISOString().slice(0, 10)
}

export function extractJsonObject(value: string) {
  const trimmed = value.trim()
  if (trimmed.startsWith("```")) {
    const withoutFence = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()
    if (withoutFence.startsWith("{")) return withoutFence
  }

  if (trimmed.startsWith("{")) return trimmed

  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)

  return trimmed
}

function parseOpenAiJson(content: string) {
  const extracted = extractJsonObject(content)
  try {
    return JSON.parse(extracted)
  } catch {
    throw new TrainingPlanGenerationError("La réponse OpenAI n'est pas un JSON valide.", content)
  }
}

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonRecord) : null
}

function normalizeSessionType(value: unknown): SessionType {
  const raw = compactText(value)?.toLowerCase() || "technique"
  if ((sessionTypes as readonly string[]).includes(raw)) return raw as SessionType

  if (raw.includes("serv")) return "service"
  if (raw.includes("phys") || raw.includes("footwork") || raw.includes("déplacement") || raw.includes("deplacement")) {
    return "physique"
  }
  if (raw.includes("match") || raw.includes("situat") || raw.includes("point")) return "match"
  if (raw.includes("compet")) return "competition"
  if (raw.includes("repos") || raw.includes("recup") || raw.includes("récup") || raw.includes("chill")) return "chill"
  return "technique"
}

function defaultSessionDuration(intensity: PlanIntensity) {
  if (intensity === "light") return 60
  if (intensity === "intensive") return 90
  return 75
}

function expectedSessionsPerWeek(intensity: PlanIntensity) {
  if (intensity === "light") return 2
  if (intensity === "intensive") return 4
  return 3
}

function normalizeExercises(value: unknown, sessionType: SessionType) {
  const items = Array.isArray(value) ? value : typeof value === "string" ? [value] : []
  const exercises = items
    .map((item) => {
      if (typeof item === "string") {
        const name = item.trim()
        return name ? { name, notes: "" } : null
      }

      const record = asRecord(item)
      if (!record) return null

      const name =
        compactText(record.name) ||
        compactText(record.title) ||
        compactText(record.exercise) ||
        compactText(record.exercice)
      if (!name) return null

      return {
        name,
        notes:
          compactText(record.notes) ||
          compactText(record.description) ||
          compactText(record.details) ||
          "",
      }
    })
    .filter((item): item is { name: string; notes: string } => Boolean(item))
    .slice(0, 8)

  if (exercises.length > 0) return exercises

  return [
    {
      name: `Bloc ${sessionType}`,
      notes: "Exercice ciblé à adapter selon la fatigue et la qualité d'exécution.",
    },
  ]
}

function normalizeSessions(value: unknown, durationWeeks: 1 | 2 | 4, intensity: PlanIntensity) {
  if (!Array.isArray(value)) {
    throw new TrainingPlanGenerationError("La clé sessions doit être un tableau.")
  }

  const sessionsPerWeek = expectedSessionsPerWeek(intensity)
  const normalized = value.map((item, index): GeneratedPlanSession => {
    const record = asRecord(item)
    if (!record) {
      throw new TrainingPlanGenerationError(`La séance ${index + 1} doit être un objet.`)
    }

    const derivedWeek = Math.floor(index / sessionsPerWeek) + 1
    const weekNumber = clamp(compactNumber(record.week_number) ?? derivedWeek, 1, durationWeeks)
    const dayOfWeek = clamp(compactNumber(record.day_of_week) ?? ((index % 5) + 1), 1, 7)
    const sessionType = normalizeSessionType(record.session_type)
    const durationMin = clamp(
      compactNumber(record.duration_min) ?? compactNumber(record.duration) ?? defaultSessionDuration(intensity),
      15,
      240
    )
    const objectives =
      compactText(record.objectives) ||
      compactText(record.objectif) ||
      compactText(record.goal) ||
      `Travailler un axe ${sessionType} prioritaire.`

    return {
      week_number: weekNumber,
      day_of_week: dayOfWeek,
      session_type: sessionType,
      duration_min: durationMin,
      objectives,
      exercises: normalizeExercises(record.exercises ?? record.exercices, sessionType),
      notes: compactText(record.notes) || "",
    }
  })

  if (normalized.length === 0) {
    throw new TrainingPlanGenerationError("Le plan doit contenir au moins une séance.")
  }

  for (let week = 1; week <= durationWeeks; week += 1) {
    if (!normalized.some((session) => session.week_number === week)) {
      const candidate = normalized[(week - 1) % normalized.length]
      normalized.push({
        ...candidate,
        week_number: week,
        day_of_week: clamp(candidate.day_of_week + 1, 1, 7),
      })
    }
  }

  return normalized
    .sort((a, b) => a.week_number - b.week_number || a.day_of_week - b.day_of_week)
    .slice(0, 36)
}

function normalizeGeneratedPlan(raw: unknown, durationWeeks: 1 | 2 | 4, intensity: PlanIntensity) {
  const record = asRecord(raw)
  if (!record) {
    throw new TrainingPlanGenerationError("Le JSON racine doit être un objet.")
  }

  const normalized = {
    title: compactText(record.title) || `Plan ${durationWeeks} semaine${durationWeeks > 1 ? "s" : ""}`,
    description:
      compactText(record.description) ||
      "Plan d'entraînement généré à partir des matchs récents et des analyses disponibles.",
    main_objective:
      compactText(record.main_objective) ||
      compactText(record.mainObjective) ||
      compactText(record.objective) ||
      "Améliorer les points faibles prioritaires identifiés par les analyses récentes.",
    duration_weeks: durationWeeks,
    intensity,
    sessions: normalizeSessions(record.sessions, durationWeeks, intensity),
  }

  const parsed = generatedPlanSchema.safeParse(normalized)
  if (!parsed.success) {
    throw new TrainingPlanGenerationError(
      "Le JSON ne respecte pas le contrat du plan.",
      JSON.stringify(raw).slice(0, 4000),
      parsed.error.issues
    )
  }

  return parsed.data
}

export function logTrainingPlanGenerationError(error: unknown) {
  if (!(error instanceof TrainingPlanGenerationError)) return

  console.warn("[coach] invalid training plan", {
    reason: error.reason,
    validationIssues: error.validationIssues,
  })

  const debug = process.env.COACH_AI_DEBUG?.toLowerCase()
  if ((debug === "1" || debug === "true") && error.rawResponse) {
    console.warn("[coach] raw OpenAI training plan response", error.rawResponse.slice(0, 8000))
  }
}

export function intensityLabel(intensity: PlanIntensity) {
  if (intensity === "light") return "léger"
  if (intensity === "intensive") return "intensif"
  return "normal"
}

function pgrProfileName(profile: PgrProfile) {
  return profile.display_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "joueur PGR"
}

function formatPgrProfileForPrompt(profile: PgrProfile | null, history: PgrRatingHistoryPoint[]) {
  if (!profile) return "- Profil PGR non lié ou indisponible."

  const lines = [
    `- Joueur: ${pgrProfileName(profile)}`,
    `- Pays: ${profile.country_code || "non renseigné"}`,
    `- Genre: ${profile.gender || "non renseigné"}`,
    `- Catégorie: ${profile.category || "non renseignée"}`,
    `- Club: ${[profile.club_name, profile.club_city].filter(Boolean).join(" · ") || "non renseigné"}`,
    `- Rating: ${profile.rating !== null ? profile.rating : "pas encore disponible"}`,
    `- Rating deviation: ${profile.rating_deviation !== null ? profile.rating_deviation : "non disponible"}`,
    `- Matchs PGR: ${profile.match_count !== null ? profile.match_count : "non disponible"}`,
    `- Confiance: ${profile.confidence_status || "non disponible"}`,
    `- Provisoire: ${profile.is_provisional === null ? "non disponible" : profile.is_provisional ? "oui" : "non"}`,
    `- Snapshot: ${profile.snapshot_date || "pas encore disponible"}`,
    `- Dernier ranking externe: ${
      [
        profile.last_external_source,
        profile.last_external_rank !== null ? `rang #${profile.last_external_rank}` : null,
        profile.last_external_value !== null ? `valeur ${profile.last_external_value}` : null,
        profile.last_external_date,
      ]
        .filter(Boolean)
        .join(", ") || "non disponible"
    }`,
    `- Points d'historique rating disponibles: ${history.length}`,
  ]

  return lines.join("\n")
}

export async function buildTrainingPlanContext(userId: string) {
  const supabase = await createClient()
  const [profileResult, matchesResult, analysesResult, goalResult, pgrProfile, pgrRatingHistory] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name, level, play_style, dominant_hand, club")
      .eq("id", userId)
      .single(),
    supabase
      .from("matches")
      .select("id, opponent_name, result, date, source, ranking_match_id, sets_won, sets_lost, ball_data, score_player, score_opponent")
      .eq("player_id", userId)
      .order("date", { ascending: false })
      .limit(8),
    supabase
      .from("match_analyses")
      .select("summary, weaknesses, recommendations, created_at")
      .eq("player_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("weekly_goals")
      .select("target_hours, target_sessions, notes")
      .eq("player_id", userId)
      .eq("week_start", currentWeekStartIso())
      .maybeSingle(),
    getMyPgrProfileSafe(),
    getMyPgrRatingHistorySafe(20),
  ])

  if (profileResult.error) throw new Error(profileResult.error.message)
  if (matchesResult.error) throw new Error(matchesResult.error.message)
  if (analysesResult.error) {
    console.warn(`[coach] plan analyses unavailable: ${analysesResult.error.message}`)
  }
  if (goalResult.error) {
    console.warn(`[coach] plan weekly goal unavailable: ${goalResult.error.message}`)
  }

  const profile = profileResult.data
  const matches = ((matchesResult.data || []) as JsonRecord[]).map((match) => {
    return `- ${compactText(match.date) || "date inconnue"} vs ${compactText(match.opponent_name) || "adversaire"}: ${compactText(match.result) || "résultat inconnu"} ${match.sets_won ?? "-"}-${match.sets_lost ?? "-"}, source ${compactText(match.source) || "manual"}, sets: ${getMatchSetsText(match)}`
  })
  const weaknesses = ((analysesResult.data || []) as JsonRecord[])
    .flatMap((analysis) => stringArray(analysis.weaknesses))
    .slice(0, 12)
  const recommendations = ((analysesResult.data || []) as JsonRecord[])
    .flatMap((analysis) => stringArray(analysis.recommendations))
    .slice(0, 12)
  const goal = goalResult.data

  return {
    profile,
    matches,
    weaknesses,
    recommendations,
    goal,
    pgrProfile,
    pgrRatingHistory,
  }
}

export async function generateTrainingPlanPreview(
  userId: string,
  durationWeeks: 1 | 2 | 4,
  intensity: PlanIntensity
) {
  const context = await buildTrainingPlanContext(userId)
  const sessionsPerWeek = expectedSessionsPerWeek(intensity)
  const totalSessions = durationWeeks * sessionsPerWeek

  const systemPrompt = `Tu es un générateur JSON strict pour une app de tennis de table.
Tu dois répondre uniquement avec un objet JSON valide.
N'ajoute aucun Markdown, aucune balise de code, aucun commentaire, aucun texte avant ou après le JSON.`

  const prompt = `Génère un plan d'entraînement brouillon, concret et lisible.

Profil:
- Nom: ${context.profile.full_name || context.profile.username}
- Niveau: ${context.profile.level || "non renseigné"}
- Style: ${context.profile.play_style || "non renseigné"}
- Main: ${context.profile.dominant_hand || "non renseignée"}
- Club: ${context.profile.club || "non renseigné"}

Profil PGR:
${formatPgrProfileForPrompt(context.pgrProfile, context.pgrRatingHistory)}

Paramètres demandés:
- Durée: ${durationWeeks} semaine${durationWeeks > 1 ? "s" : ""}
- Intensité: ${intensityLabel(intensity)}
- Rythme exact: ${sessionsPerWeek} séances par semaine
- Nombre total exact de séances: ${totalSessions}

Objectif hebdo:
- Séances: ${context.goal?.target_sessions ?? "non renseigné"}
- Heures: ${context.goal?.target_hours ?? "non renseigné"}
- Notes: ${context.goal?.notes || "aucune"}

Derniers matchs:
${context.matches.join("\n") || "- Aucun match récent"}

Faiblesses détectées:
${context.weaknesses.map((item) => `- ${item}`).join("\n") || "- Aucune analyse existante"}

Recommandations déjà données:
${context.recommendations.map((item) => `- ${item}`).join("\n") || "- Aucune recommandation existante"}

Réponds uniquement avec ce JSON exact. Toutes les clés listées sont obligatoires:
{
  "title": "string",
  "description": "string",
  "main_objective": "string",
  "duration_weeks": ${durationWeeks},
  "intensity": "${intensity}",
  "sessions": [
    {
      "week_number": 1,
      "day_of_week": 1,
      "session_type": "technique",
      "duration_min": 75,
      "objectives": "string",
      "exercises": [
        { "name": "string", "notes": "string" }
      ],
      "notes": "string"
    }
  ]
}

Contraintes:
- duration_weeks doit valoir ${durationWeeks}.
- intensity doit valoir "${intensity}".
- sessions doit contenir exactement ${totalSessions} séances.
- Chaque semaine de 1 à ${durationWeeks} doit contenir exactement ${sessionsPerWeek} séances.
- week_number doit être un entier entre 1 et ${durationWeeks}.
- day_of_week doit être un entier entre 1 et 7.
- session_type doit être uniquement l'une de ces valeurs: "technique", "physique", "match", "service", "competition", "chill".
- exercises doit toujours être un tableau d'objets { "name": "string", "notes": "string" }, jamais un tableau de strings.
- Chaque séance doit être actionnable et courte à comprendre.
- Les exercices doivent être spécifiques tennis de table.
- Si le profil PGR contient un rating, une confiance ou une catégorie, utilise-les pour calibrer l'intensité et la difficulté.
- Si le rating PGR est "pas encore disponible", ne l'invente pas et base-toi sur les matchs, analyses et objectifs hebdo.`

  const completion = await createOpenAiChatCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    json: true,
    maxCompletionTokens: 2200,
    temperature: 0.2,
  })

  if (!completion.configured) {
    return { configured: false as const, payload: getAiNotConfiguredPayload(), status: 503 }
  }

  const generated = normalizeGeneratedPlan(parseOpenAiJson(completion.content), durationWeeks, intensity)
  return {
    configured: true as const,
    plan: generated satisfies GeneratedTrainingPlan,
    model: completion.model,
  }
}

export async function programSupportsStatusColumn() {
  const supabase = await createClient()
  const { error } = await supabase.from("training_programs").select("status").limit(1)
  return !error
}
