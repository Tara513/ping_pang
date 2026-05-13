"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { PlayerLevel, SessionType } from "@/types/database"

export interface ProgramSessionInput {
  week_number: number
  day_of_week: number
  session_type: SessionType
  duration_min?: number
  objectives?: string
  exercises?: Array<{ name: string; notes?: string }>
  notes?: string
}

export interface CreateProgramInput {
  title: string
  description?: string
  duration_weeks: number
  level?: PlayerLevel
  sessions: ProgramSessionInput[]
}

export async function createProgram(input: CreateProgramInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  // Désactiver l'ancien programme actif
  await supabase
    .from("training_programs")
    .update({ is_active: false })
    .eq("player_id", user.id)
    .eq("is_active", true)

  const { data: program, error: progError } = await supabase
    .from("training_programs")
    .insert({
      player_id: user.id,
      title: input.title,
      description: input.description ?? null,
      duration_weeks: input.duration_weeks,
      level: input.level ?? null,
      is_active: true,
    })
    .select()
    .single()

  if (progError) throw new Error(progError.message)

  if (input.sessions.length > 0) {
    const { error: sessError } = await supabase
      .from("program_sessions")
      .insert(
        input.sessions.map(s => ({
          program_id: program.id,
          week_number: s.week_number,
          day_of_week: s.day_of_week,
          session_type: s.session_type,
          duration_min: s.duration_min ?? null,
          objectives: s.objectives ?? null,
          exercises: s.exercises ?? [],
          notes: s.notes ?? null,
        }))
      )
    if (sessError) throw new Error(sessError.message)
  }

  revalidatePath("/program")
  return program
}

export async function getActiveProgram() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("training_programs")
    .select("*, program_sessions(*)")
    .eq("player_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}

export async function getAllPrograms() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("training_programs")
    .select("*, program_sessions(count)")
    .eq("player_id", user.id)
    .order("created_at", { ascending: false })

  return data || []
}

export async function markProgramSessionComplete(
  programSessionId: string,
  completedSessionId: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const { error } = await supabase
    .from("program_sessions")
    .update({ completed: true, completed_session_id: completedSessionId })
    .eq("id", programSessionId)

  if (error) throw new Error(error.message)
  revalidatePath("/program")
}

export async function deleteProgram(programId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const { error } = await supabase
    .from("training_programs")
    .delete()
    .eq("id", programId)
    .eq("player_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/program")
}
