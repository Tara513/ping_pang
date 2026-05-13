import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Mistral } from "@mistralai/mistralai"
import { z } from "zod"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const chatPostSchema = z.object({
  chat_id: z.string().uuid().optional(),
  message: z.string().trim().min(1, "Message vide").max(4000),
  match_id: z.string().uuid().optional(),
  session_id: z.string().uuid().optional(),
}).refine((value) => !(value.match_id && value.session_id), {
  message: "Choisis un match ou une séance, pas les deux",
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

  const parsed = chatPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Paramètres invalides" },
      { status: 400 }
    )
  }

  const { chat_id, message, match_id, session_id } = parsed.data
  let existingMessages: ChatMessage[] = []
  let chatId = chat_id

  if (chatId) {
    const { data: chat, error: chatError } = await supabase
      .from("analysis_chats")
      .select("messages")
      .eq("id", chatId)
      .eq("player_id", user.id)
      .single()
    if (chatError || !chat) {
      return NextResponse.json({ error: "Chat introuvable" }, { status: 404 })
    }
    existingMessages = (chat?.messages as ChatMessage[]) || []
  }

  // Build system context from match or session (only on first message)
  let systemContext = "Tu es un coach expert en tennis de table. Tu analyses les performances du joueur et réponds en français de manière concise, précise et actionnable. Tu utilises des exemples concrets liés au tennis de table."

  if (existingMessages.length === 0) {
    if (match_id) {
      const { data: match, error: matchError } = await supabase
        .from("matches").select("*").eq("id", match_id).eq("player_id", user.id).single()
      if (matchError || !match) {
        return NextResponse.json({ error: "Match introuvable" }, { status: 404 })
      }
      if (match) {
        systemContext += `\n\nContexte — Match analysé:
- Adversaire: ${match.opponent_name}
- Résultat: ${match.result === "win" ? "Victoire" : "Défaite"} ${match.sets_won}-${match.sets_lost}
- Type: ${match.match_type}
- Date: ${match.date}
- Notes: ${match.notes || "aucune"}`
      }
    }
    if (session_id) {
      const { data: session, error: sessionError } = await supabase
        .from("sessions").select("*").eq("id", session_id).eq("player_id", user.id).single()
      if (sessionError || !session) {
        return NextResponse.json({ error: "Séance introuvable" }, { status: 404 })
      }
      if (session) {
        systemContext += `\n\nContexte — Séance analysée:
- Type: ${session.session_type}
- Durée: ${session.duration_min} min
- Date: ${session.date}
- Ressenti: ${session.feeling ?? "N/A"}/5 — Fatigue: ${session.fatigue ?? "N/A"}/5 — Motivation: ${session.motivation ?? "N/A"}/5
- Notes: ${session.notes || "aucune"}`
      }
    }
  }

  const userMsg: ChatMessage = { role: "user", content: message, timestamp: new Date().toISOString() }
  const allMessages = [...existingMessages, userMsg]

  if (!process.env.MISTRAL_APIKEY) {
    return NextResponse.json({ error: "Service IA non configuré" }, { status: 500 })
  }

  const mistral = new Mistral({ apiKey: process.env.MISTRAL_APIKEY! })

  let replyContent: string
  try {
    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: systemContext },
        ...allMessages.slice(-20).map(m => ({ role: m.role, content: m.content })),
      ],
    })
    const raw = response.choices?.[0]?.message?.content
    replyContent = typeof raw === "string" ? raw : "Je ne peux pas répondre pour l'instant."
  } catch {
    replyContent = "Erreur lors de la génération de la réponse. Réessaie dans un instant."
  }

  const assistantMsg: ChatMessage = {
    role: "assistant",
    content: replyContent,
    timestamp: new Date().toISOString(),
  }
  const updatedMessages = [...allMessages, assistantMsg]

  if (chatId) {
    const { error } = await supabase
      .from("analysis_chats")
      .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
      .eq("id", chatId)
      .eq("player_id", user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const title = match_id
      ? "Analyse de match"
      : session_id
      ? "Analyse de séance"
      : "Coaching IA"

    const { data: newChat, error } = await supabase
      .from("analysis_chats")
      .insert({
        player_id: user.id,
        match_id: match_id || null,
        session_id: session_id || null,
        title,
        messages: updatedMessages,
      })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    chatId = newChat?.id
  }

  return NextResponse.json({
    chat_id: chatId,
    reply: replyContent,
    messages: updatedMessages,
  })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const match_id = searchParams.get("match_id")
  const session_id = searchParams.get("session_id")

  let query = supabase
    .from("analysis_chats")
    .select("id, title, created_at, updated_at, match_id, session_id")
    .eq("player_id", user.id)
    .order("updated_at", { ascending: false })

  if (match_id) query = query.eq("match_id", match_id)
  if (session_id) query = query.eq("session_id", session_id)

  const { data, error } = await query.limit(20)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
