import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const analyzeMatchRequestSchema = z.object({
  match_id: z.string().uuid(),
})

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

  if (!process.env.MISTRAL_APIKEY) {
    return NextResponse.json({ error: "Service IA non configuré" }, { status: 500 })
  }

  const setsStr = match.score_player?.map((p: number, i: number) =>
    `Set ${i + 1}: ${p}-${(match.score_opponent?.[i]) ?? 0}`
  ).join(", ") || "Non disponible"

  const prompt = `Tu es un expert analyste en tennis de table. Analyse ce match comme chess.com analyse les parties d'échecs.

Adversaire: ${match.opponent_name}
Résultat: ${match.result === "win" ? "Victoire" : "Défaite"}
Score global: ${match.sets_won}-${match.sets_lost}
Détail des sets: ${setsStr}
Type: ${match.match_type || "Amical"}
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
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_APIKEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur API Mistral" }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    if (typeof content !== "string") {
      return NextResponse.json({ error: "Réponse IA invalide" }, { status: 502 })
    }

    return NextResponse.json(JSON.parse(content))
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 })
  }
}
