import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Mistral } from "@mistralai/mistralai"
import { z } from "zod"

const bilanRequestSchema = z.object({
  type: z.enum(["week", "season"]),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).refine((value) => value.period_start <= value.period_end, {
  message: "Période invalide",
})

const recapContentSchema = z.object({
  resume: z.string(),
  points_forts: z.array(z.string()),
  points_amelioration: z.array(z.string()),
  recommandations: z.array(z.string()),
  objectif_prochain: z.string(),
  score_global: z.number().min(0).max(100),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 })
  }

  const parsed = bilanRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Paramètres invalides" },
      { status: 400 }
    )
  }

  const { type, period_start, period_end } = parsed.data

  const [sessionsRes, matchesRes] = await Promise.all([
    supabase.from("sessions").select("*").eq("player_id", user.id)
      .gte("date", period_start).lte("date", period_end),
    supabase.from("matches").select("*").eq("player_id", user.id)
      .gte("date", period_start).lte("date", period_end),
  ])

  if (sessionsRes.error) return NextResponse.json({ error: sessionsRes.error.message }, { status: 500 })
  if (matchesRes.error) return NextResponse.json({ error: matchesRes.error.message }, { status: 500 })

  const sessions = sessionsRes.data || []
  const matches = matchesRes.data || []
  const totalHours = Math.round(sessions.reduce((a, s) => a + (s.duration_min || 0) / 60, 0) * 10) / 10
  const wins = matches.filter(m => m.result === "win").length
  const losses = matches.filter(m => m.result === "loss").length

  const sessionNotes = sessions.filter(s => s.notes).map(s => `- ${s.session_type}: ${s.notes}`).join("\n")
  const avgFeeling = sessions.filter(s => s.feeling).length > 0
    ? (sessions.reduce((a, s) => a + (s.feeling || 0), 0) / sessions.filter(s => s.feeling).length).toFixed(1)
    : null

  const context = `
Joueur de tennis de table. Bilan ${type === "week" ? "de semaine" : "de saison"} du ${period_start} au ${period_end}.

Séances: ${sessions.length} séances pour un total de ${totalHours}h.
Types pratiqués: ${[...new Set(sessions.map(s => s.session_type))].join(", ") || "aucun"}.
Ressenti moyen: ${avgFeeling ? `${avgFeeling}/5` : "non renseigné"}.

Matchs: ${matches.length} matchs (${wins} victoire${wins > 1 ? "s" : ""}, ${losses} défaite${losses > 1 ? "s" : ""}).

Notes de séances:
${sessionNotes || "Aucune note."}
`.trim()

  if (!process.env.MISTRAL_APIKEY) {
    return NextResponse.json({ error: "Service IA non configuré" }, { status: 500 })
  }

  const mistral = new Mistral({ apiKey: process.env.MISTRAL_APIKEY! })

  let content: Record<string, unknown>
  try {
    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content: `Tu es un coach expert en tennis de table. Génère un bilan structuré en JSON valide (sans markdown, sans backticks) avec exactement ces clés:
{
  "resume": "string — synthèse courte de la période",
  "points_forts": ["string", ...] — 2-3 points positifs,
  "points_amelioration": ["string", ...] — 2-3 axes de progrès,
  "recommandations": ["string", ...] — 3 conseils concrets pour la suite,
  "objectif_prochain": "string — un objectif clair pour la prochaine période",
  "score_global": number — note de 0 à 100 sur la qualité de la période
}`,
        },
        { role: "user", content: context },
      ],
    })

    const raw = response.choices?.[0]?.message?.content
    const rawStr = typeof raw === "string" ? raw : JSON.stringify(raw)
    const parsedContent = recapContentSchema.safeParse(JSON.parse(rawStr))
    if (!parsedContent.success) {
      return NextResponse.json({ error: "Réponse IA invalide" }, { status: 502 })
    }
    content = parsedContent.data
  } catch {
    return NextResponse.json({ error: "Erreur lors de la génération du bilan" }, { status: 502 })
  }

  const { data: recap, error } = await supabase
    .from("recaps")
    .insert({
      player_id: user.id,
      type,
      period_start,
      period_end,
      content,
      sessions_count: sessions.length,
      matches_count: matches.length,
      total_hours: totalHours,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(recap)
}
