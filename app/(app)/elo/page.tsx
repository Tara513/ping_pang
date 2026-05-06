"use client"

export const dynamic = "force-dynamic"


import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Card from "@/components/ui/Card"
import type { EloRating, EloHistory, Federation } from "@/types/database"
import { FEDERATION_META, estimateRankPercentile, FEDERATION_CONFIGS } from "@/lib/elo/calculator"
import { demoEloRatings, demoEloHistory } from "@/lib/seeds/demoData"

const FEDERATIONS = Object.keys(FEDERATION_META) as Federation[]

function EloHistoryChart({ history, federation }: { history: typeof demoEloHistory; federation: Federation }) {
  const data = history
    .filter((h) => h.federation === federation)
    .map((h, i) => ({
      match: `M${i + 1}`,
      elo: h.elo_after,
      delta: h.delta,
    }))

  if (data.length === 0) return <div className="text-olive text-sm text-center py-8">Pas encore d&apos;historique</div>

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="match" tick={{ fill: "#8A9178", fontSize: 10 }} />
        <YAxis tick={{ fill: "#8A9178", fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: "#2A2A2A", border: "none", color: "#F5F2EC", fontSize: 11 }}
          formatter={(v, name) => [v, String(name) === "elo" ? "ELO" : "Delta"]}
        />
        <Line dataKey="elo" stroke="#4A5240" strokeWidth={2.5} dot={false} name="ELO" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function EloPage() {
  const supabase = createClient()
  const [ratings, setRatings] = useState<Partial<EloRating>[]>([])
  const [history, setHistory] = useState(demoEloHistory)
  const [selectedFed, setSelectedFed] = useState<Federation>("custom")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [ratingRes, histRes] = await Promise.all([
        supabase.from("elo_ratings").select("*").eq("player_id", user.id),
        supabase.from("elo_history").select("*").eq("player_id", user.id).order("recorded_at", { ascending: true }),
      ])

      setRatings(ratingRes.data?.length ? ratingRes.data : demoEloRatings as EloRating[])
      if (histRes.data?.length) setHistory(histRes.data as typeof demoEloHistory)
      setLoading(false)
    }
    load()
  }, [supabase])

  const currentRating = ratings.find((r) => r.federation === selectedFed)
  const config = FEDERATION_CONFIGS[selectedFed]

  const fedHistory = history.filter((h) => h.federation === selectedFed)
  const lastDelta = fedHistory.length > 0 ? fedHistory[fedHistory.length - 1].delta : 0

  return (
    <>
      <TopBar title="ELO" />
      <PageWrapper>
        {/* Federation selector */}
        <div className="flex gap-2 pt-4 pb-4 overflow-x-auto no-scrollbar">
          {FEDERATIONS.map((fed) => {
            const meta = FEDERATION_META[fed]
            const hasRating = ratings.some((r) => r.federation === fed)
            return (
              <button
                key={fed}
                onClick={() => setSelectedFed(fed)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide flex-shrink-0 border transition-all ${
                  selectedFed === fed
                    ? "bg-kaki border-kaki text-white"
                    : hasRating
                    ? "border-white/30 text-white"
                    : "border-white/10 text-olive hover:border-white/30"
                }`}
              >
                <span>{meta.flag}</span>
                <span>{meta.name}</span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="bg-anthracite h-40" />
            <div className="bg-anthracite h-32" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* ELO principal */}
            <div className="bg-kaki/10 border border-kaki/30 p-6 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-olive uppercase tracking-widest mb-1">
                  {FEDERATION_META[selectedFed].flag} {FEDERATION_META[selectedFed].name}
                </div>
                <div className="font-display text-7xl text-white leading-none">
                  {currentRating?.elo ?? config.baseRating}
                </div>
                <div className="text-olive text-sm mt-1">
                  {currentRating ? estimateRankPercentile(currentRating.elo!, selectedFed) : "Non classé"}
                </div>
              </div>
              <div className="text-right">
                {lastDelta !== 0 && (
                  <div className={`font-display text-3xl leading-none ${lastDelta > 0 ? "text-kaki" : "text-red"}`}>
                    {lastDelta > 0 ? "+" : ""}{lastDelta}
                  </div>
                )}
                {!currentRating && (
                  <div className="text-xs text-olive">Pas encore de données</div>
                )}
              </div>
            </div>

            {/* History chart */}
            <Card>
              <div className="text-[10px] text-olive uppercase tracking-wider mb-3 font-semibold">Évolution ELO</div>
              <EloHistoryChart history={history} federation={selectedFed} />
            </Card>

            {/* Recent matches */}
            {fedHistory.length > 0 && (
              <Card>
                <div className="text-[10px] text-olive uppercase tracking-wider mb-3 font-semibold">Derniers matchs</div>
                <div className="flex flex-col gap-2">
                  {fedHistory.slice(-5).reverse().map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                      <div className="text-sm text-white">Match #{fedHistory.length - i}</div>
                      <div className={`font-display text-xl ${h.delta > 0 ? "text-kaki" : "text-red"}`}>
                        {h.delta > 0 ? "+" : ""}{h.delta}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* All federations overview */}
            {ratings.length > 1 && (
              <Card>
                <div className="text-[10px] text-olive uppercase tracking-wider mb-3 font-semibold">Tous mes ELO</div>
                <div className="flex flex-col gap-2">
                  {ratings.map((r) => {
                    const meta = FEDERATION_META[r.federation as Federation]
                    return (
                      <button
                        key={r.federation}
                        onClick={() => setSelectedFed(r.federation as Federation)}
                        className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span>{meta?.flag}</span>
                          <span className="text-sm text-white">{meta?.name}</span>
                        </div>
                        <div className="font-display text-2xl text-white">{r.elo}</div>
                      </button>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>
        )}
      </PageWrapper>
    </>
  )
}
