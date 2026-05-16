import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { planSaveRequestSchema } from "../schema"
import { programSupportsStatusColumn } from "../helpers"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 })
  }

  const parsed = planSaveRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("level")
    .eq("id", user.id)
    .single()

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  const plan = parsed.data.plan
  const supportsStatus = await programSupportsStatusColumn()
  const programPayload: Record<string, unknown> = {
    player_id: user.id,
    title: plan.title,
    description: [plan.description, plan.main_objective ? `Objectif: ${plan.main_objective}` : null]
      .filter(Boolean)
      .join("\n\n"),
    duration_weeks: plan.duration_weeks,
    level: profile.level ?? null,
    is_active: false,
    created_by_coach: true,
    coach_id: null,
  }

  if (supportsStatus) programPayload.status = "draft"

  const { data: program, error: programError } = await supabase
    .from("training_programs")
    .insert(programPayload)
    .select("id, title, description, duration_weeks, created_at, is_active")
    .single()

  if (programError) return NextResponse.json({ error: programError.message }, { status: 500 })

  const { error: sessionsError } = await supabase.from("program_sessions").insert(
    plan.sessions.map((session) => ({
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

  if (sessionsError) return NextResponse.json({ error: sessionsError.message }, { status: 500 })

  revalidatePath("/coach")
  revalidatePath("/programs")
  revalidatePath("/dashboard")

  return NextResponse.json({
    program,
    sessions_count: plan.sessions.length,
    is_active: false,
    status: supportsStatus ? "draft" : null,
  })
}
