import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { z } from "zod"
import { createOpenAiChatCompletion, getAiNotConfiguredPayload } from "@/lib/ai/config"
import { createClient } from "@/lib/supabase/server"
import {
  extractSetsFromBallData,
  extractSetsFromScoreArrays,
  formatSetsForPrompt,
} from "@/lib/utils/match-sets"

const generatedSessionSchema = z.object({
  week_number: z.number().int().min(1).max(12),
  day_of_week: z.number().int().min(1).max(7),
  session_type: z.enum(["technique", "physique", "match", "service", "competition", "chill"]),
  duration_min: z.number().int().min(15).max(240).nullable().optional(),
  objectives: z.string().max(600).nullable().optional(),
  exercises: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        notes: z.string().max(400).optional(),
      })
    )
    .max(8)
    .default([]),
  notes: z.string().max(600).nullable().optional(),
})

const generatedPlanSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1200),
  duration_weeks: z.number().int().min(1).max(12),
  sessions: z.array(generatedSessionSchema).min(1).max(36),
})

type JsonRecord = Record<string, unknown>

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function compactText(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

function getMatchSetsText(match: JsonRecord) {
  const setsFromBallData = extractSetsFromBallData(match.ball_data)
  const fallbackSets =
    setsFromBallData.length > 0 ? [] : extractSetsFromScoreArrays(match.score_player, match.score_opponent)
  return formatSetsForPrompt(setsFromBallData.length > 0 ? setsFromBallData : fallbackSets)
}

function extractJsonObject(value: string) {
  const trimmed = value.trim()
  if (trimmed.startsWith("{")) return trimmed

  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)

  return trimmed
}

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const weekStart = new Date()
  const day = weekStart.getDay()
  weekStart.setDate(weekStart.getDate() + (day === 0 ? -6 : 1 - day))
  const weekStartIso = weekStart.toISOString().slice(0, 10)

  const [profileResult, matchesResult, analysesResult, goalResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name, level, play_style, dominant_hand, club")
      .eq("id", user.id)
      .single(),
    supabase
      .from("matches")
      .select("id, opponent_name, result, date, source, ranking_match_id, sets_won, sets_lost, ball_data, score_player, score_opponent")
      .eq("player_id", user.id)
      .order("date", { ascending: false })
      .limit(8),
    supabase
      .from("match_analyses")
      .select("summary, weaknesses, recommendations, created_at")
      .eq("player_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("weekly_goals")
      .select("target_hours, target_sessions, notes")
      .eq("player_id", user.id)
      .eq("week_start", weekStartIso)
      .maybeSingle(),
  ])

  if (profileResult.error) return NextResponse.json({ error: profileResult.error.message }, { status: 500 })
  if (matchesResult.error) return NextResponse.json({ error: matchesResult.error.message }, { status: 500 })
  if (analysesResult.error) {
    console.warn(`[coach] plan analyses unavailable: ${analysesResult.error.message}`)
  }
  if (goalResult.error) {
    console.warn(`[coach] plan weekly goal unavailable: ${goalResult.error.message}`)
  }

  const profile = profileResult.data
  const matches = ((matchesResult.data || []) as JsonRecord[]).map((match) => {
    return `- ${compactText(match.date) || "date inconnue"} vs ${compactText(match.opponent_name) || "adversaire"}: ${compactText(match.result) || "résultat inconnu"} ${match.sets_won ?? "-"}-${match.sets_lost ?? "-"}, source ${compactText(match.source) || "manual"}, ranking ${compactText(match.ranking_match_id) || "aucun"}, sets: ${getMatchSetsText(match)}`
  })
  const weaknesses = ((analysesResult.data || []) as JsonRecord[])
    .flatMap((analysis) => stringArray(analysis.weaknesses))
    .slice(0, 12)
  const recommendations = ((analysesResult.data || []) as JsonRecord[])
    .flatMap((analysis) => stringArray(analysis.recommendations))
    .slice(0, 12)
  const goal = goalResult.data

  const prompt = `Tu es un coach expert en tennis de table. Génère un plan d'entraînement brouillon, concret et court.

Profil:
- Nom: ${profile.full_name || profile.username}
- Niveau: ${profile.level || "non renseigné"}
- Style: ${profile.play_style || "non renseigné"}
- Main: ${profile.dominant_hand || "non renseignée"}
- Club: ${profile.club || "non renseigné"}

Objectif hebdo:
- Séances: ${goal?.target_sessions ?? "non renseigné"}
- Heures: ${goal?.target_hours ?? "non renseigné"}
- Notes: ${goal?.notes || "aucune"}

Derniers matchs:
${matches.join("\n") || "- Aucun match récent"}

Faiblesses détectées:
${weaknesses.map((item) => `- ${item}`).join("\n") || "- Aucune analyse existante"}

Recommandations déjà données:
${recommendations.map((item) => `- ${item}`).join("\n") || "- Aucune recommandation existante"}

Réponds uniquement en JSON valide, sans markdown, au format:
{
  "title": "string",
  "description": "string",
  "duration_weeks": 2,
  "sessions": [
    {
      "week_number": 1,
      "day_of_week": 1,
      "session_type": "technique",
      "duration_min": 75,
      "objectives": "string",
      "exercises": [{ "name": "string", "notes": "string" }],
      "notes": "string"
    }
  ]
}

Contraintes:
- 2 à 4 semaines.
- 2 à 4 séances par semaine.
- Privilégie technique, service, match et physique.
- Objectifs et exercices actionnables, pas de théorie vague.`

  let generatedPlan: z.infer<typeof generatedPlanSchema>
  try {
    const completion = await createOpenAiChatCompletion({
      messages: [{ role: "user", content: prompt }],
      json: true,
      maxCompletionTokens: 2200,
    })

    if (!completion.configured) {
      return NextResponse.json(getAiNotConfiguredPayload(), { status: 503 })
    }

    generatedPlan = generatedPlanSchema.parse(JSON.parse(extractJsonObject(completion.content)))
  } catch {
    return NextResponse.json({ error: "Plan IA invalide" }, { status: 502 })
  }

  const { data: program, error: programError } = await supabase
    .from("training_programs")
    .insert({
      player_id: user.id,
      title: generatedPlan.title,
      description: generatedPlan.description,
      duration_weeks: generatedPlan.duration_weeks,
      level: profile.level ?? null,
      is_active: false,
      created_by_coach: true,
      coach_id: null,
    })
    .select("id, title, description, duration_weeks, created_at")
    .single()

  if (programError) {
    return NextResponse.json({ error: programError.message }, { status: 500 })
  }

  const { error: sessionsError } = await supabase.from("program_sessions").insert(
    generatedPlan.sessions.map((session) => ({
      program_id: program.id,
      week_number: session.week_number,
      day_of_week: session.day_of_week,
      session_type: session.session_type,
      duration_min: session.duration_min ?? null,
      objectives: session.objectives ?? null,
      exercises: session.exercises,
      notes: session.notes ?? null,
    }))
  )

  if (sessionsError) {
    return NextResponse.json({ error: sessionsError.message }, { status: 500 })
  }

  revalidatePath("/coach")
  revalidatePath("/programs")
  revalidatePath("/dashboard")

  return NextResponse.json({
    program,
    sessions_count: generatedPlan.sessions.length,
    is_active: false,
  })
}
