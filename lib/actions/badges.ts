"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Vérifie et attribue les badges mérités pour l'utilisateur connecté.
 * Appelle la fonction SQL check_and_award_badges qui insère uniquement
 * les badges non encore obtenus.
 * Retourne la liste des types de badges nouvellement gagnés.
 */
export async function checkAndAwardBadges(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const before = new Date()

  const { error } = await supabase.rpc("check_and_award_badges", {
    p_player_id: user.id,
  })

  if (error) {
    console.error("[badges] check_and_award_badges error:", error.message)
    return []
  }

  // Retourner les badges obtenus dans cette invocation (earned_at >= before)
  const { data: newBadges } = await supabase
    .from("badges")
    .select("badge_type")
    .eq("player_id", user.id)
    .gte("earned_at", before.toISOString())

  return (newBadges || []).map(b => b.badge_type)
}

export async function getPlayerBadges(playerId?: string) {
  const supabase = await createClient()

  let uid = playerId
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    uid = user.id
  }

  const { data } = await supabase
    .from("badges")
    .select("*")
    .eq("player_id", uid)
    .order("earned_at", { ascending: false })

  return data || []
}
