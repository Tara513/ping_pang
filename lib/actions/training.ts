"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  completeTrainingOnboardingSchema,
  createPersonalMatchSchema,
  createTrainingSessionSchema,
  updateTrainingProfileSchema,
} from "@/lib/validation/training"

type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string }

function firstValidationError(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message || "Données invalides"
}

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user }
}

async function refreshPersonalBadges(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { error } = await supabase.rpc("check_and_award_badges", {
    p_player_id: userId,
  })

  if (error) {
    console.error("[training] badge refresh failed:", error.message)
  }
}

export async function createTrainingSession(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return { ok: false, error: "Non authentifié" }

  const parsed = createTrainingSessionSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: firstValidationError(parsed.error) }
  }

  const session = parsed.data
  const hasDescription = session.has_description === true

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      player_id: user.id,
      session_type: session.session_type,
      duration_min: session.duration_min,
      date: session.date,
      location: session.location,
      notes: session.notes,
      exercises: session.exercises,
      feeling: hasDescription ? session.feeling ?? null : null,
      fatigue: hasDescription ? session.fatigue ?? null : null,
      motivation: hasDescription ? session.motivation ?? null : null,
      confidence: hasDescription ? session.confidence ?? null : null,
      has_description: hasDescription,
    })
    .select("id")
    .single()

  if (error) return { ok: false, error: error.message }

  await refreshPersonalBadges(supabase, user.id)
  revalidatePath("/dashboard")
  revalidatePath("/stats")
  revalidatePath("/calendar")
  revalidatePath("/profile")

  return { ok: true, data: { id: data.id } }
}

export async function createPersonalMatch(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return { ok: false, error: "Non authentifié" }

  const parsed = createPersonalMatchSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: firstValidationError(parsed.error) }
  }

  const match = parsed.data
  const setsWon = match.sets.filter((set) => set.player > set.opponent).length
  const setsLost = match.sets.length - setsWon

  const { data, error } = await supabase
    .from("matches")
    .insert({
      player_id: user.id,
      opponent_name: match.opponent_name,
      match_type: match.match_type,
      date: match.date,
      location: match.location,
      result: setsWon > setsLost ? "win" : "loss",
      score_player: match.sets.map((set) => set.player),
      score_opponent: match.sets.map((set) => set.opponent),
      sets_won: setsWon,
      sets_lost: setsLost,
      notes: match.notes,
    })
    .select("id")
    .single()

  if (error) return { ok: false, error: error.message }

  await refreshPersonalBadges(supabase, user.id)
  revalidatePath("/dashboard")
  revalidatePath("/stats")
  revalidatePath("/calendar")
  revalidatePath("/profile")

  return { ok: true, data: { id: data.id } }
}

export async function updateTrainingProfile(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return { ok: false, error: "Non authentifié" }

  const parsed = updateTrainingProfileSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: firstValidationError(parsed.error) }
  }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/profile")
  revalidatePath("/profile/settings")

  return { ok: true, data: { id: user.id } }
}

export async function completeTrainingOnboarding(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return { ok: false, error: "Non authentifié" }

  const parsed = completeTrainingOnboardingSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: firstValidationError(parsed.error) }
  }

  const onboarding = parsed.data
  const username =
    onboarding.username === "player"
      ? `player_${user.id.slice(0, 8)}`
      : onboarding.username

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      username,
      full_name: onboarding.full_name,
      bio: onboarding.bio,
      country: onboarding.country || "FR",
      city: onboarding.city,
      club: onboarding.club,
      level: onboarding.level ?? null,
      play_style: onboarding.play_style ?? null,
      dominant_hand: onboarding.dominant_hand ?? null,
      is_coach: false,
    })

  if (profileError) return { ok: false, error: profileError.message }

  if (!onboarding.skip_equipment && onboarding.blade) {
    const { error: equipmentError } = await supabase
      .from("equipment")
      .insert({
        player_id: user.id,
        blade: onboarding.blade,
        rubber_fh: onboarding.rubber_fh,
        rubber_bh: onboarding.rubber_bh,
        thickness_fh: onboarding.thickness_fh ?? null,
        thickness_bh: onboarding.thickness_bh ?? null,
        is_current: true,
        started_at: new Date().toISOString().split("T")[0],
      })

    if (equipmentError) return { ok: false, error: equipmentError.message }
  }

  if (onboarding.target_hours) {
    const monday = new Date()
    monday.setDate(monday.getDate() - monday.getDay() + 1)
    const weekStart = monday.toISOString().split("T")[0]

    const { data: existingGoal, error: goalLookupError } = await supabase
      .from("weekly_goals")
      .select("id")
      .eq("player_id", user.id)
      .eq("week_start", weekStart)
      .maybeSingle()

    if (goalLookupError) return { ok: false, error: goalLookupError.message }

    const goalPayload = {
      player_id: user.id,
      week_start: weekStart,
      target_hours: onboarding.target_hours,
    }

    const { error: goalError } = existingGoal
      ? await supabase
          .from("weekly_goals")
          .update({ target_hours: onboarding.target_hours })
          .eq("id", existingGoal.id)
          .eq("player_id", user.id)
      : await supabase
          .from("weekly_goals")
          .insert(goalPayload)

    if (goalError) return { ok: false, error: goalError.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/profile")
  revalidatePath("/program")

  return { ok: true, data: { id: user.id } }
}
