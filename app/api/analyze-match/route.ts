import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { match } = await request.json()

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
    return NextResponse.json(JSON.parse(content))
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 })
  }
}
