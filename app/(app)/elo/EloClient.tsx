"use client"

import { useState } from "react"
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
import { TrendingUp, TrendingDown } from "lucide-react"
import type { SharedEloRating } from "@/lib/data/shared-profile"
import { formatElo, FEDERATION_LABELS, formatDate } from "@/lib/utils/format"

export function EloClient({ ratings }: { ratings: SharedEloRating[] }) {
  const [active, setActive] = useState(ratings[0]?.federation || "")
  const activeRating = ratings.find((rating) => rating.federation === active)

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-xl text-onyx">ELO joueur</h2>

      {ratings.length === 0 ? (
        <Card>
          <p className="text-sm text-onyx-500">
            Aucun ELO n’est lié à ton profil Supabase. Training ne crée pas d’ELO local.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {ratings.map((rating) => (
              <button
                key={rating.federation}
                onClick={() => setActive(rating.federation)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  active === rating.federation
                    ? "bg-evergreen text-pp-white"
                    : "bg-white border border-onyx-200 text-onyx-600 hover:border-onyx-400"
                }`}
              >
                {rating.federation}
              </button>
            ))}
          </div>

          {activeRating && (
            <>
              <Card className="border-evergreen/20">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div>
                    <p className="text-xs text-onyx-400 mb-1">
                      {FEDERATION_LABELS[activeRating.federation] || activeRating.federation}
                    </p>
                    <p className="font-heading font-black text-5xl text-onyx">
                      {formatElo(activeRating.elo)}
                    </p>
                  </div>
                  <Badge variant="outline">Supabase</Badge>
                </div>
                <p className="text-xs text-onyx-400 mt-2">
                  Dernière MàJ : {formatDate(activeRating.updated_at, "d MMM yyyy")}
                </p>
              </Card>

              {activeRating.history.length > 0 && (
                <>
                  <Card>
                    <CardTitle className="mb-4">Évolution</CardTitle>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={activeRating.history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                          formatter={(value) => [formatElo(Number(value)), "ELO"]}
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
                      {[...activeRating.history].reverse().map((point) => (
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
        </>
      )}
    </div>
  )
}
