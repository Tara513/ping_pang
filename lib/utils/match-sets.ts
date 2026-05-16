export interface SetScore {
  player: number
  opponent: number
}

type JsonRecord = Record<string, unknown>

export function isPlainRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function numberFromUnknown(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function pickNumber(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = numberFromUnknown(record[key])
    if (value !== null) return value
  }
  return null
}

function parseScoreText(value: unknown): SetScore | null {
  if (typeof value !== "string") return null
  const match = value.match(/(\d+)\s*[-:/]\s*(\d+)/)
  if (!match) return null
  return {
    player: Number(match[1] ?? 0),
    opponent: Number(match[2] ?? 0),
  }
}

function parseScorePair(value: unknown): SetScore | null {
  if (!Array.isArray(value) || value.length < 2) return null

  const player = numberFromUnknown(value[0])
  const opponent = numberFromUnknown(value[1])

  return player !== null && opponent !== null ? { player, opponent } : null
}

function parseSetEntry(entry: unknown): SetScore | null {
  const arrayScore = parseScorePair(entry)
  if (arrayScore) return arrayScore

  const textScore = parseScoreText(entry)
  if (textScore) return textScore

  if (!isPlainRecord(entry)) return null

  const nestedArrayScore = parseScorePair(entry.score) ?? parseScorePair(entry.scores)
  if (nestedArrayScore) return nestedArrayScore

  const nestedTextScore = parseScoreText(entry.score) ?? parseScoreText(entry.result)
  const player =
    pickNumber(entry, ["player", "player_score", "score_player", "player_points", "my_score", "home_score"]) ??
    nestedTextScore?.player ??
    null
  const opponent =
    pickNumber(entry, ["opponent", "opponent_score", "score_opponent", "opponent_points", "their_score", "away_score"]) ??
    nestedTextScore?.opponent ??
    null

  return player !== null && opponent !== null ? { player, opponent } : null
}

export function extractSetsFromBallData(ballData: unknown): SetScore[] {
  if (!isPlainRecord(ballData) || !Array.isArray(ballData.sets_detail)) return []

  return ballData.sets_detail.flatMap((entry) => {
    const set = parseSetEntry(entry)
    return set ? [set] : []
  })
}

export function extractSetsFromScoreArrays(
  scorePlayer: unknown,
  scoreOpponent: unknown
): SetScore[] {
  if (!Array.isArray(scorePlayer) || !Array.isArray(scoreOpponent)) return []

  return scorePlayer.flatMap((playerScore, index) => {
    const player = numberFromUnknown(playerScore)
    const opponent = numberFromUnknown(scoreOpponent[index])
    return player !== null && opponent !== null ? [{ player, opponent }] : []
  })
}

export function formatSetsForPrompt(sets: SetScore[]) {
  if (sets.length === 0) return "Non disponible"

  return sets
    .map((set, index) => `Set ${index + 1} : ${set.player}-${set.opponent}`)
    .join("\n")
}
