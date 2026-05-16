"use client"

import { Card, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingDown, TrendingUp } from "lucide-react"
import type { PgrPageData } from "@/lib/data/shared-profile"
import { formatDate, formatElo } from "@/lib/utils/format"

type PgrRecord = Record<string, unknown>

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function getNumber(record: PgrRecord | null | undefined, keys: string[]) {
  if (!record) return null
  for (const key of keys) {
    const value = toNumber(record[key])
    if (value !== null) return value
  }
  return null
}

function getText(record: PgrRecord | null | undefined, keys: string[]) {
  if (!record) return null
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.length > 0) return value
  }
  return null
}

export function EloClient({ data }: { data: PgrPageData }) {
  const pgrProfile = data.pgrProfile
  const rating = pgrProfile?.rating ?? null
  const rank = pgrProfile?.last_external_rank ?? null
  const displayName =
    (pgrProfile
      ? pgrProfile.display_name || [pgrProfile.first_name, pgrProfile.last_name].filter(Boolean).join(" ")
      : null) ||
    data.profile.full_name ||
    data.profile.username
  const updatedAt = pgrProfile?.snapshot_date

  const history = data.ratingHistory
    .map((point) => {
      const record = point as PgrRecord
      return {
        date: getText(record, ["date", "recorded_at", "created_at"]) || "",
        rating: getNumber(record, ["rating", "rating_after", "glicko_rating"]),
        delta: getNumber(record, ["delta", "rating_delta"]),
      }
    })
    .filter((point): point is { date: string; rating: number; delta: number | null } => {
      return point.date.length > 0 && point.rating !== null
    })

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-xl text-onyx">Ranking PGR</h2>

      {!pgrProfile ? (
        <Card>
          <p className="text-sm text-onyx-500">
            Aucun profil PGR n’est lié à ton compte. Training lit le ranking via les RPC PGR et ne crée pas de classement local.
          </p>
        </Card>
      ) : (
        <>
          <Card className="border-evergreen/20">
            <div className="flex items-start justify-between mb-3 gap-3">
              <div>
                <p className="text-xs text-onyx-400 mb-1">{displayName}</p>
                <p className="font-heading font-black text-5xl text-onyx">
                  {rating !== null ? formatElo(rating) : "-"}
                </p>
                {rating === null && (
                  <p className="mt-1 text-xs text-onyx-500">Profil PGR lié, rating pas encore disponible.</p>
                )}
              </div>
              <Badge variant="outline">{rank !== null ? `#${rank}` : "PGR"}</Badge>
            </div>
            {updatedAt && (
              <p className="text-xs text-onyx-400 mt-2">
                Dernière MàJ : {formatDate(updatedAt, "d MMM yyyy")}
              </p>
            )}
          </Card>

          {history.length > 0 && (
            <>
              <Card>
                <CardTitle className="mb-4">Évolution</CardTitle>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#888" }}
                      tickFormatter={(value) => formatDate(value, "MMM")}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 10, fill: "#888" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e8e8e8" }}
                      formatter={(value) => [formatElo(Number(value)), "PGR"]}
                      labelFormatter={(label) => formatDate(String(label), "d MMM yyyy")}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#092C25"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#092C25" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <CardTitle className="mb-3">Historique</CardTitle>
                <div className="space-y-2">
                  {[...history].reverse().map((point) => (
                    <div
                      key={`${point.date}-${point.rating}`}
                      className="flex items-center justify-between py-1.5 border-b border-onyx-50 last:border-0"
                    >
                      <p className="text-sm text-onyx-600">{formatDate(point.date, "d MMM yyyy")}</p>
                      <div className="flex items-center gap-2">
                        {point.delta !== null && (
                          <span
                            className={`flex items-center gap-0.5 text-xs font-semibold ${
                              point.delta >= 0 ? "text-evergreen" : "text-mauve"
                            }`}
                          >
                            {point.delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {point.delta >= 0 ? "+" : ""}
                            {point.delta}
                          </span>
                        )}
                        <span className="font-heading font-bold text-sm text-onyx tabular-nums">
                          {formatElo(point.rating)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {data.pgrMatches.length > 0 && (
        <Card>
          <CardTitle className="mb-3">Matchs PGR récents</CardTitle>
          <div className="space-y-2">
            {data.pgrMatches.slice(0, 5).map((match, index) => {
              const record = match as PgrRecord
              const opponent = getText(record, ["opponent_name", "opponent", "player_b_name"]) || "Adversaire"
              const date = getText(record, ["date", "played_at", "created_at"])
              const result = getText(record, ["result", "outcome"])
              return (
                <div key={getText(record, ["match_id", "pgr_match_id"]) || index} className="flex items-center justify-between py-1.5 border-b border-onyx-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-onyx">vs {opponent}</p>
                    {date && <p className="text-xs text-onyx-400">{formatDate(date, "d MMM yyyy")}</p>}
                  </div>
                  {result && <Badge variant={result === "win" ? "lime" : "outline"} size="sm">{result}</Badge>}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {data.leaderboard.length > 0 && (
        <Card>
          <CardTitle className="mb-3">Leaderboard PGR</CardTitle>
          <div className="space-y-2">
            {data.leaderboard.slice(0, 5).map((entry, index) => {
              const record = entry as PgrRecord
              const entryName = getText(record, ["display_name"]) || "Joueur"
              const entryRating = getNumber(record, ["rating"])
              const entryRank = getNumber(record, ["rank"]) ?? index + 1
              return (
                <div key={getText(record, ["player_id"]) || index} className="flex items-center justify-between py-1.5 border-b border-onyx-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-onyx">#{entryRank} {entryName}</p>
                    <p className="text-xs text-onyx-400">{getText(record, ["country_code", "country"]) || "PGR"}</p>
                  </div>
                  <span className="font-heading font-bold text-sm text-onyx tabular-nums">
                    {entryRating !== null ? formatElo(entryRating) : "-"}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
