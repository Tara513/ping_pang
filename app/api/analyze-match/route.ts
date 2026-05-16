import { createClient } from "@/lib/supabase/server"
import { createOpenAiChatCompletion, getAiNotConfiguredPayload } from "@/lib/ai/config"
import {
  extractSetsFromBallData,
  extractSetsFromScoreArrays,
  formatSetsForPrompt,
} from "@/lib/utils/match-sets"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const analyzeMatchRequestSchema = z.object({
  match_id: z.string().uuid(),
})

const aiAnalysisSchema = z.object({
  rating: z.number().int().min(0).max(100).nullable().optional(),
  summary: z.string().min(1),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  critical_moments: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
})

type AnalysisPayload = z.infer<typeof aiAnalysisSchema>
type JsonRecord = Record<string, unknown>

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function textOrFallback(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() !== "" ? value : fallback
}

function normalizeAnalysisRow(row: JsonRecord) {
  return {
    id: textOrFallback(row.id, `analysis-${Date.now()}`),
    match_id: textOrFallback(row.match_id, ""),
    player_id: textOrFallback(row.player_id, ""),
    user_id: textOrFallback(row.player_id, ""),
    rating: numberOrNull(row.rating),
    summary: textOrFallback(row.summary, "Analyse enregistrée."),
    strengths: stringArray(row.strengths),
    weaknesses: stringArray(row.weaknesses),
    critical_moments: stringArray(row.critical_moments),
    recommendations: stringArray(row.recommendations),
    model_used: typeof row.model_used === "string" ? row.model_used : null,
    created_at: textOrFallback(row.created_at, new Date().toISOString()),
    generated_at: textOrFallback(row.created_at, new Date().toISOString()),
    status: "done",
  }
}

function normalizeGeneratedAnalysis(
  matchId: string,
  playerId: string,
  analysis: AnalysisPayload,
  modelUsed: string,
  createdAt = new Date().toISOString()
) {
  return {
    id: `analysis-${Date.now()}`,
    match_id: matchId,
    player_id: playerId,
    user_id: playerId,
    rating: analysis.rating ?? null,
    summary: analysis.summary,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    critical_moments: analysis.critical_moments,
    recommendations: analysis.recommendations,
    model_used: modelUsed,
    created_at: createdAt,
    generated_at: createdAt,
    status: "done",
  }
}

function extractJsonObject(value: string) {
  const trimmed = value.trim()
  if (trimmed.startsWith("{")) return trimmed

  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)

  return trimmed
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 })
  }

  const parsed = analyzeMatchRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", parsed.data.match_id)
    .eq("player_id", user.id)
    .single()

  if (matchError || !match) {
    return NextResponse.json({ error: "Match introuvable" }, { status: 404 })
  }

  const { data: existingAnalysis, error: existingAnalysisError } = await supabase
    .from("match_analyses")
    .select("id, match_id, player_id, rating, summary, strengths, weaknesses, critical_moments, recommendations, model_used, created_at")
    .eq("match_id", parsed.data.match_id)
    .eq("player_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingAnalysisError) {
    console.warn(`[coach] match_analyses lookup failed: ${existingAnalysisError.message}`)
  } else if (existingAnalysis) {
    return NextResponse.json(normalizeAnalysisRow(existingAnalysis as JsonRecord))
  }

  const setsFromBallData = extractSetsFromBallData(match.ball_data)
  const fallbackSets =
    setsFromBallData.length > 0 ? [] : extractSetsFromScoreArrays(match.score_player, match.score_opponent)
  const sets = setsFromBallData.length > 0 ? setsFromBallData : fallbackSets
  const setsSource =
    setsFromBallData.length > 0
      ? "ball_data.sets_detail"
      : fallbackSets.length > 0
      ? "score_player/score_opponent"
      : "non disponible"
  const setsDetailText = formatSetsForPrompt(sets)

  const prompt = `Tu es un expert analyste en tennis de table. Analyse ce match comme chess.com analyse les parties d'échecs.

Adversaire: ${match.opponent_name}
Résultat: ${match.result === "win" ? "Victoire" : "Défaite"}
Score global: ${match.sets_won}-${match.sets_lost}
Date: ${match.date}
Type: ${match.match_type || "Amical"}
Source Training: ${match.source || "manual"}
Ranking match id: ${match.ranking_match_id || "aucun"}
Détail des sets (${setsSource}):
${setsDetailText}
${match.notes ? `Notes du joueur: ${match.notes}` : ""}

Réponds UNIQUEMENT en JSON valide avec ce format exact:
{
  "rating": <entier entre 0 et 100>,
  "summary": "<1-2 phrases résumant le match>",
  "strengths": ["<point fort 1>", "<point fort 2>", "<point fort 3>"],
  "weaknesses": ["<point à améliorer 1>", "<point à améliorer 2>", "<point à améliorer 3>"],
  "critical_moments": ["<moment décisif 1>", "<moment décisif 2>"],
  "recommendations": ["<conseil concret 1>", "<conseil concret 2>", "<conseil concret 3>"]
  }`

  try {
    const completion = await createOpenAiChatCompletion({
      messages: [{ role: "user", content: prompt }],
      json: true,
      maxCompletionTokens: 900,
    })

    if (!completion.configured) {
      return NextResponse.json(getAiNotConfiguredPayload(), { status: 503 })
    }

    const analysis = aiAnalysisSchema.parse(JSON.parse(extractJsonObject(completion.content)))
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("match_analyses")
      .insert({
        match_id: parsed.data.match_id,
        player_id: user.id,
        rating: analysis.rating ?? null,
        summary: analysis.summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        critical_moments: analysis.critical_moments,
        recommendations: analysis.recommendations,
        model_used: completion.model,
      })
      .select("id, match_id, player_id, rating, summary, strengths, weaknesses, critical_moments, recommendations, model_used, created_at")
      .single()

    if (saveError) {
      console.warn(`[coach] match_analyses insert failed: ${saveError.message}`)
      return NextResponse.json({
        ...normalizeGeneratedAnalysis(parsed.data.match_id, user.id, analysis, completion.model),
        warning: "Analyse générée, mais sauvegarde impossible",
      })
    }

    return NextResponse.json(normalizeAnalysisRow(savedAnalysis as JsonRecord))
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 })
  }
}
