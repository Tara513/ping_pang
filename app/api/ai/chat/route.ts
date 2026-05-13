import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Mistral } from "@mistralai/mistralai"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const body = await req.json()
  const { chat_id, message, match_id, session_id } = body as {
    chat_id?: string
    message: string
    match_id?: string
    session_id?: string
  }

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 })
  }

  let existingMessages: ChatMessage[] = []
  let chatId = chat_id

  if (chatId) {
    const { data: chat } = await supabase
      .from("analysis_chats")
      .select("messages")
      .eq("id", chatId)
      .eq("player_id", user.id)
      .single()
    existingMessages = (chat?.messages as ChatMessage[]) || []
  }

  // Build system context from match or session (only on first message)
  let systemContext = "Tu es un coach expert en tennis de table. Tu analyses les performances du joueur et réponds en français de manière concise, précise et actionnable. Tu utilises des exemples concrets liés au tennis de table."

  if (existingMessages.length === 0) {
    if (match_id) {
      const { data: match } = await supabase
        .from("matches").select("*").eq("id", match_id).single()
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
      const { data: session } = await supabase
        .from("sessions").select("*").eq("id", session_id).single()
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

  const mistral = new Mistral({ apiKey: process.env.MISTRAL_APIKEY! })

  let replyContent: string
  try {
    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: systemContext },
        ...allMessages.map(m => ({ role: m.role, content: m.content })),
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
    await supabase
      .from("analysis_chats")
      .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
      .eq("id", chatId)
  } else {
    const title = match_id
      ? "Analyse de match"
      : session_id
      ? "Analyse de séance"
      : "Coaching IA"

    const { data: newChat } = await supabase
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
