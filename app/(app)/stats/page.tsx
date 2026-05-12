"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import type { Session, Match } from "@/types/database"
import { demoSessions, demoMatches } from "@/lib/seeds/demoData"
import { eachWeekOfInterval, subMonths, format } from "date-fns"
import { fr } from "date-fns/locale"

const FILTERS = [
  { value: "week", label: "7j" },
  { value: "month", label: "30j" },
  { value: "season", label: "6m" },
  { value: "all", label: "Tout" },
]

const TYPE_COLORS: Record<string, string> = {
  technique: "#1A5C4A", physique: "#7A9E8E", match: "#C72927",
  service: "#D4C9B5", competition: "#D4C9B5", chill: "#2A2A2A",
}

export default function StatsPage() {
  const supabase = createClient()
  const [filter, setFilter] = useState("month")
  const [sessions, setSessions] = useState<Partial<Session>[]>([])
  const [matches, setMatches] = useState<Partial<Match>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [sRes, mRes] = await Promise.all([
        supabase.from("sessions").select("*").eq("player_id", user.id).order("date", { ascending: false }),
        supabase.from("matches").select("*").eq("player_id", user.id).order("date", { ascending: false }),
      ])
      setSessions(sRes.data?.length ? sRes.data : demoSessions as Session[])
      setMatches(mRes.data?.length ? mRes.data : demoMatches as Match[])
      setLoading(false)
    }
    load()
  }, [supabase])

  const cutoff = (() => {
    const now = new Date()
    if (filter === "week") return new Date(now.getTime() - 7 * 86400000)
    if (filter === "month") return new Date(now.getTime() - 30 * 86400000)
    if (filter === "season") return new Date(now.getTime() - 180 * 86400000)
    return new Date(0)
  })()

  const fs = sessions.filter((s) => new Date(s.date!) >= cutoff)
  const fm = matches.filter((m) => new Date(m.date!) >= cutoff)
  const totalHours = Math.round(fs.reduce((a, s) => a + (s.duration_min || 0), 0) / 60 * 10) / 10
  const wins = fm.filter((m) => m.result === "win").length
  const winRate = fm.length > 0 ? Math.round((wins / fm.length) * 100) : 0

  const streak = (() => {
    let count = 0
    const sorted = [...sessions].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
    for (const s of sorted) {
      const diff = Math.floor((Date.now() - new Date(s.date!).getTime()) / 86400000)
      if (diff <= count + 1) count++
      else break
    }
    return count
  })()

  const weeklyData = eachWeekOfInterval({ start: subMonths(new Date(), 3), end: new Date() }, { weekStartsOn: 1 })
    .slice(-10).map((wk) => {
      const end = new Date(wk); end.setDate(end.getDate() + 7)
      const h = sessions.filter((s) => { const d = new Date(s.date!); return d >= wk && d < end })
        .reduce((a, s) => a + (s.duration_min || 0), 0) / 60
      return { week: format(wk, "d MMM", { locale: fr }), heures: Math.round(h * 10) / 10 }
    })

  const radarData = ["technique", "physique", "service", "match", "competition", "chill"].map((t) => {
    const count = fs.filter((s) => s.session_type === t).length
    return { subject: t.charAt(0).toUpperCase() + t.slice(1), A: count }
  })

  const feelingData = fs.filter((s) => s.feeling).slice(-12).map((s) => ({
    date: format(new Date(s.date!), "d/M"),
    r: s.feeling, m: s.motivation, c: s.confidence,
  }))

  return (
    <>
      <TopBar title="Stats" />
      <PageWrapper noPadding>
        {/* Filter tabs */}
        <div className="flex border-b border-white/[0.06]">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-sans transition-all border-b-2 -mb-px ${
                filter === f.value
                  ? "border-white text-white"
                  : "border-transparent text-sage/50 hover:text-sage"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="px-4 pt-8 animate-pulse space-y-6">
            <div className="h-32 bg-surface" />
            <div className="h-24 bg-surface" />
          </div>
        ) : (
          <div className="px-4">
            {/* Hero stats — big numbers */}
            <div className="-mx-4 bg-green px-4 py-8 mb-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-1">Heures jouées</div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-light text-white leading-none" style={{ fontSize: 72 }}>
                      {totalHours}
                    </span>
                    <span className="font-display text-2xl text-green-light font-light">h</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-1">Win rate</div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-light text-white leading-none" style={{ fontSize: 48 }}>
                      {winRate}
                    </span>
                    <span className="font-display text-xl text-green-light font-light">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary stats — line based */}
            <div className="flex flex-col mb-6">
              {[
                { label: "Séances", value: fs.length, sub: `sur la période` },
                { label: "Matchs joués", value: fm.length, sub: `${wins} victoires` },
                { label: "Série actuelle", value: `${streak}j`, sub: streak > 2 ? "🔥 Continue !" : "En cours" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-white/[0.05]">
                  <div>
                    <div className="text-[9px] text-sage uppercase tracking-[0.2em]">{item.label}</div>
                    <div className="text-[11px] text-sage/50 mt-0.5">{item.sub}</div>
                  </div>
                  <div className="font-display text-4xl font-light text-white">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Weekly hours chart */}
            <div className="mb-6">
              <div className="text-[9px] text-sage uppercase tracking-[0.25em] mb-4">Heures / semaine</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                  <XAxis dataKey="week" tick={{ fill: "#7A9E8E", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7A9E8E", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#F0EDE6", fontSize: 11, borderRadius: 0 }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="heures" fill="#0B362D" name="Heures" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-px bg-white/[0.06] mb-6" />

            {/* Radar */}
            <div className="mb-6">
              <div className="text-[9px] text-sage uppercase tracking-[0.25em] mb-4">Répartition des séances</div>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#7A9E8E", fontSize: 9 }} />
                  <Radar dataKey="A" stroke="#1A5C4A" fill="#1A5C4A" fillOpacity={0.3} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Feeling chart */}
            {feelingData.length > 0 && (
              <>
                <div className="h-px bg-white/[0.06] mb-6" />
                <div className="mb-6">
                  <div className="text-[9px] text-sage uppercase tracking-[0.25em] mb-2">Ressenti / motivation / confiance</div>
                  <div className="flex gap-4 mb-3">
                    {[["#1A5C4A","Ressenti"],["#D4C9B5","Motivation"],["#7A9E8E","Confiance"]].map(([c, l]) => (
                      <div key={l} className="flex items-center gap-1.5">
                        <div className="w-2 h-0.5" style={{ background: c }} />
                        <span className="text-[9px] text-sage uppercase tracking-widest">{l}</span>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={feelingData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fill: "#7A9E8E", fontSize: 8 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[1, 5]} tick={{ fill: "#7A9E8E", fontSize: 8 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#F0EDE6", fontSize: 11, borderRadius: 0 }} />
                      <Line dataKey="r" stroke="#1A5C4A" strokeWidth={1.5} dot={false} name="Ressenti" />
                      <Line dataKey="m" stroke="#D4C9B5" strokeWidth={1.5} dot={false} name="Motivation" />
                      <Line dataKey="c" stroke="#7A9E8E" strokeWidth={1.5} dot={false} name="Confiance" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Text summary */}
            <div className="mb-8 border-l-2 border-green-light pl-4 py-2">
              <p className="text-sm text-white/70 leading-relaxed font-sans">
                {filter === "week" ? "Cette semaine" : filter === "month" ? "Ce mois" : filter === "season" ? "Cette saison" : "Au total"},{" "}
                <span className="text-white">{totalHours}h</span> jouées en{" "}
                <span className="text-white">{fs.length} séances</span>.{" "}
                {fm.length > 0 && <>Win rate de <span className={winRate >= 50 ? "text-green-light" : "text-red"}>{winRate}%</span>.</>}
                {streak > 2 && <> {streak} jours consécutifs 🔥</>}
              </p>
            </div>
          </div>
        )}
      </PageWrapper>
    </>
  )
}
