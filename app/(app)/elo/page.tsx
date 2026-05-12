"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import type { EloRating, Federation } from "@/types/database"
import { FEDERATION_META, estimateRankPercentile, FEDERATION_CONFIGS } from "@/lib/elo/calculator"
import { demoEloRatings, demoEloHistory } from "@/lib/seeds/demoData"

const FEDERATIONS = Object.keys(FEDERATION_META) as Federation[]

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

  const chartData = fedHistory.map((h, i) => ({
    match: `M${i + 1}`,
    elo: h.elo_after,
    delta: h.delta,
  }))

  const currentElo = currentRating?.elo ?? config?.baseRating ?? 1000

  return (
    <>
      <TopBar title="ELO" />
      <PageWrapper noPadding>
        {/* Federation scroll */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-white/[0.06] px-4 py-3 gap-3">
          {FEDERATIONS.map((fed) => {
            const meta = FEDERATION_META[fed]
            const hasRating = ratings.some((r) => r.federation === fed)
            return (
              <button
                key={fed}
                onClick={() => setSelectedFed(fed)}
                className={`flex items-center gap-2 flex-shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-sans border transition-all ${
                  selectedFed === fed
                    ? "border-white text-white"
                    : hasRating
                    ? "border-white/30 text-white/60"
                    : "border-white/10 text-sage/50"
                }`}
              >
                <span>{meta.flag}</span>
                <span>{meta.name}</span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="px-4 pt-6 animate-pulse space-y-4">
            <div className="h-40 bg-surface" />
            <div className="h-32 bg-surface" />
          </div>
        ) : (
          <>
            {/* ELO hero */}
            <div className="bg-green px-4 pt-8 pb-7">
              <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-1">
                {FEDERATION_META[selectedFed].flag} {FEDERATION_META[selectedFed].name}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="font-display font-light text-white leading-none" style={{ fontSize: 88 }}>
                    {currentElo}
                  </div>
                  <div className="text-[11px] text-sage mt-2">
                    {currentRating ? estimateRankPercentile(currentRating.elo!, selectedFed) : "Non classé"}
                  </div>
                </div>
                {lastDelta !== 0 && (
                  <div className="text-right pb-3">
                    <div className={`font-display font-light leading-none ${lastDelta > 0 ? "text-green-light" : "text-red"}`} style={{ fontSize: 40 }}>
                      {lastDelta > 0 ? "+" : ""}{lastDelta}
                    </div>
                    <div className="text-[9px] text-sage uppercase tracking-widest mt-1">dernier match</div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-4">
              {/* Chart */}
              {chartData.length > 0 && (
                <div className="mb-6">
                  <div className="text-[9px] text-sage uppercase tracking-[0.25em] mb-4">Évolution</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="match" tick={{ fill: "#7A9E8E", fontSize: 8 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#7A9E8E", fontSize: 8 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#F0EDE6", fontSize: 11, borderRadius: 0 }}
                        cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                      />
                      <Line dataKey="elo" stroke="#1A5C4A" strokeWidth={1.5} dot={false} name="ELO" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent matches */}
              {fedHistory.length > 0 && (
                <div className="mb-6">
                  <div className="text-[9px] text-sage uppercase tracking-[0.25em] mb-3">Derniers matchs</div>
                  {fedHistory.slice(-5).reverse().map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-white/[0.05]">
                      <div className="text-[9px] text-sage uppercase tracking-[0.2em]">
                        Match #{fedHistory.length - i}
                      </div>
                      <div className={`font-display text-2xl font-light ${h.delta > 0 ? "text-green-light" : "text-red"}`}>
                        {h.delta > 0 ? "+" : ""}{h.delta}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* All federations */}
              {ratings.length > 1 && (
                <div>
                  <div className="text-[9px] text-sage uppercase tracking-[0.25em] mb-3">Toutes les fédérations</div>
                  {ratings.map((r) => {
                    const meta = FEDERATION_META[r.federation as Federation]
                    return (
                      <button
                        key={r.federation}
                        onClick={() => setSelectedFed(r.federation as Federation)}
                        className="flex items-center justify-between py-4 border-b border-white/[0.05] w-full text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{meta?.flag}</span>
                          <div>
                            <div className="text-sm text-white font-sans">{meta?.name}</div>
                            <div className="text-[10px] text-sage">{meta?.country}</div>
                          </div>
                        </div>
                        <div className="font-display text-3xl font-light text-white">{r.elo}</div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Empty state */}
              {!currentRating && (
                <div className="text-center py-8">
                  <div className="text-[10px] text-sage uppercase tracking-[0.2em]">
                    Pas encore de données pour cette fédération
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </PageWrapper>
    </>
  )
}
