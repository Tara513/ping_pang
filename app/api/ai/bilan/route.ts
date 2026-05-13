import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Mistral } from "@mistralai/mistralai"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const body = await req.json()
  const { type, period_start, period_end } = body as {
    type: "week" | "season"
    period_start: string
    period_end: string
  }

  if (!type || !period_start || !period_end) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
  }

  const [sessionsRes, matchesRes] = await Promise.all([
    supabase.from("sessions").select("*").eq("player_id", user.id)
      .gte("date", period_start).lte("date", period_end),
    supabase.from("matches").select("*").eq("player_id", user.id)
      .gte("date", period_start).lte("date", period_end),
  ])

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
    content = JSON.parse(rawStr)
  } catch {
    content = {
      resume: "Bilan généré automatiquement.",
      points_forts: ["Régularité dans l'entraînement"],
      points_amelioration: ["Augmenter la diversité des types de séances"],
      recommandations: ["Continuer sur cette lancée"],
      objectif_prochain: "Maintenir le rythme la semaine prochaine",
      score_global: 65,
    }
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
