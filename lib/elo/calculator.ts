import type { Federation } from "@/types/database"

interface EloConfig {
  federation: Federation
  kFactor: number
  baseRating: number
  floorRating: number
}

export const FEDERATION_CONFIGS: Record<Federation, EloConfig> = {
  FFTT:   { federation: "FFTT",   kFactor: 20, baseRating: 500,  floorRating: 100 },
  RFETM:  { federation: "RFETM",  kFactor: 24, baseRating: 1000, floorRating: 200 },
  DTTB:   { federation: "DTTB",   kFactor: 16, baseRating: 1500, floorRating: 500 },
  ETTU:   { federation: "ETTU",   kFactor: 16, baseRating: 1500, floorRating: 500 },
  ITTF:   { federation: "ITTF",   kFactor: 12, baseRating: 2000, floorRating: 800 },
  custom: { federation: "custom", kFactor: 32, baseRating: 1500, floorRating: 100 },
}

export const FEDERATION_META: Record<Federation, { name: string; flag: string; country: string }> = {
  FFTT:   { name: "FFTT",     flag: "🇫🇷", country: "France" },
  RFETM:  { name: "RFETM",    flag: "🇪🇸", country: "Espagne" },
  DTTB:   { name: "DTTB",     flag: "🇩🇪", country: "Allemagne" },
  ETTU:   { name: "ETTU",     flag: "🇪🇺", country: "Europe" },
  ITTF:   { name: "ITTF",     flag: "🌍", country: "International" },
  custom: { name: "PingTrack", flag: "⭐", country: "App" },
}

export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  result: "win" | "loss",
  federation: Federation
): { newElo: number; delta: number } {
  const config = FEDERATION_CONFIGS[federation]
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400))
  const actualScore = result === "win" ? 1 : 0
  const delta = Math.round(config.kFactor * (actualScore - expectedScore))
  const newElo = Math.max(config.floorRating, playerElo + delta)
  return { newElo, delta }
}

export function estimateRankPercentile(elo: number, federation: Federation): string {
  const config = FEDERATION_CONFIGS[federation]
  const base = config.baseRating
  if (elo > base * 2) return "Top 1%"
  if (elo > base * 1.7) return "Top 5%"
  if (elo > base * 1.4) return "Top 15%"
  if (elo > base * 1.2) return "Top 30%"
  if (elo > base * 1.0) return "Top 50%"
  return "En progression"
}
