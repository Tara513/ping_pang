import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type {
  PgrLeaderboardEntry,
  PgrMatch,
  PgrProfile,
  PgrRatingHistoryPoint,
} from "@/types/database"

export interface PgrLeaderboardParams {
  limit?: number
  countryCode?: string | null
  gender?: string | null
}

export interface PgrMatchesParams {
  limit?: number
  validationStatus?: string | null
}

type RpcRecord = Record<string, unknown>

function assertRpcSuccess(error: { message?: string } | null, fallback: string) {
  if (error) {
    throw new Error(error.message || fallback)
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function warnPgrReadFailure(operation: string, error: unknown) {
  console.warn(`[pgr] ${operation}: ${getErrorMessage(error, "lecture PGR indisponible")}`)
}

function firstRpcRow(data: unknown): RpcRecord | null {
  if (Array.isArray(data)) {
    const first = data[0]
    return typeof first === "object" && first !== null ? (first as RpcRecord) : null
  }

  return typeof data === "object" && data !== null ? (data as RpcRecord) : null
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null
}

function mapPgrProfile(data: unknown): PgrProfile | null {
  const row = firstRpcRow(data)
  if (!row) return null

  return {
    player_id: stringValue(row.player_id),
    display_name: stringValue(row.display_name),
    first_name: stringValue(row.first_name),
    last_name: stringValue(row.last_name),
    country_code: stringValue(row.country_code),
    gender: stringValue(row.gender),
    category: stringValue(row.category),
    club_name: stringValue(row.club_name),
    club_city: stringValue(row.club_city),
    rating: numberValue(row.rating),
    rating_deviation: numberValue(row.rating_deviation),
    volatility: numberValue(row.volatility),
    match_count: numberValue(row.match_count),
    confidence_status: stringValue(row.confidence_status),
    is_provisional: booleanValue(row.is_provisional),
    initialization_source: stringValue(row.initialization_source),
    snapshot_date: stringValue(row.snapshot_date),
    last_external_source: stringValue(row.last_external_source),
    last_external_rank: numberValue(row.last_external_rank),
    last_external_value: numberValue(row.last_external_value),
    last_external_date: stringValue(row.last_external_date),
  }
}

export async function getPgrLeaderboard(
  params: PgrLeaderboardParams = {}
): Promise<PgrLeaderboardEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_pgr_leaderboard", {
    p_limit: params.limit ?? 100,
    p_country_code: params.countryCode ?? null,
    p_gender: params.gender ?? null,
  })

  assertRpcSuccess(error, "Impossible de charger le leaderboard PGR")
  return (data || []) as PgrLeaderboardEntry[]
}

export async function getMyPgrProfile(): Promise<PgrProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_my_pgr_profile")

  assertRpcSuccess(error, "Impossible de charger le profil PGR")
  return mapPgrProfile(data)
}

export async function getPgrLeaderboardSafe(
  params: PgrLeaderboardParams = {}
): Promise<PgrLeaderboardEntry[]> {
  try {
    return await getPgrLeaderboard(params)
  } catch (error) {
    warnPgrReadFailure("get_pgr_leaderboard", error)
    return []
  }
}

export async function getMyPgrProfileSafe(): Promise<PgrProfile | null> {
  try {
    return await getMyPgrProfile()
  } catch (error) {
    warnPgrReadFailure("get_my_pgr_profile", error)
    return null
  }
}

export async function getMyPgrMatches(params: PgrMatchesParams = {}): Promise<PgrMatch[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_my_pgr_matches", {
    p_limit: params.limit ?? 50,
    p_validation_status: params.validationStatus ?? null,
  })

  assertRpcSuccess(error, "Impossible de charger les matchs PGR")
  return (data || []) as PgrMatch[]
}

export async function getMyPgrMatchesSafe(params: PgrMatchesParams = {}): Promise<PgrMatch[]> {
  try {
    return await getMyPgrMatches(params)
  } catch (error) {
    warnPgrReadFailure("get_my_pgr_matches", error)
    return []
  }
}

export async function getMyPgrRatingHistory(limit = 100): Promise<PgrRatingHistoryPoint[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_my_pgr_rating_history", {
    p_limit: limit,
  })

  assertRpcSuccess(error, "Impossible de charger l'historique PGR")
  return (data || []) as PgrRatingHistoryPoint[]
}

export async function getMyPgrRatingHistorySafe(limit = 100): Promise<PgrRatingHistoryPoint[]> {
  try {
    return await getMyPgrRatingHistory(limit)
  } catch (error) {
    warnPgrReadFailure("get_my_pgr_rating_history", error)
    return []
  }
}

export async function claimPgrPlayer(pgrPlayerId: string): Promise<PgrProfile | null> {
  "use server"

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("claim_pgr_player", {
    p_pgr_player_id: pgrPlayerId,
  })

  assertRpcSuccess(error, "Impossible de lier le profil PGR")
  revalidatePath("/elo")
  revalidatePath("/profile")
  revalidatePath("/coach")
  return mapPgrProfile(data)
}

export async function unclaimPgrPlayer(): Promise<PgrProfile | null> {
  "use server"

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("unclaim_pgr_player")

  assertRpcSuccess(error, "Impossible de délier le profil PGR")
  revalidatePath("/elo")
  revalidatePath("/profile")
  revalidatePath("/coach")
  return mapPgrProfile(data)
}
