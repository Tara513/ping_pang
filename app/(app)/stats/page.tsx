"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import type { Session, Match } from "@/types/database"
import { demoSessions, demoMatches } from "@/lib/seeds/demoData"
import { format, eachWeekOfInterval, subMonths } from "date-fns"
import { fr } from "date-fns/locale"

const FILTER_OPTIONS = [
  { value: "week", label: "7 jours" },
  { value: "month", label: "30 jours" },
  { value: "season", label: "6 mois" },
  { value: "all", label: "Tout" },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] text-ppp-muted uppercase tracking-[0.14em] font-serif font-semibold mb-3">
      {children}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  )
}

function WeeklyHoursChart({ sessions }: { sessions: Partial<Session>[] }) {
  const weeks = eachWeekOfInterval({ start: subMonths(new Date(), 3), end: new Date() }, { weekStartsOn: 1 })
  const data = weeks.slice(-10).map((weekStart) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.date!)
      return d >= weekStart && d < weekEnd
    })
    const hours = weekSessions.reduce((acc, s) => acc + (s.duration_min || 0), 0) / 60
    return { week: format(weekStart, "d MMM", { locale: fr }), heures: Math.round(hours * 10) / 10 }
  })

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
        <XAxis dataKey="week" tick={{ fill: "#6B6B6B", fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#6B6B6B", fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", color: "#1A1A1A", fontSize: 11, borderRadius: 12 }} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
        <Bar dataKey="heures" fill="#2D4A3E" name="Heures" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function SessionTypeRadar({ sessions }: { sessions: Partial<Session>[] }) {
  const types = ["technique", "physique", "service", "match", "competition", "chill"]
  const counts = Object.fromEntries(types.map((t) => [t, 0]))
  sessions.forEach((s) => { if (s.session_type && counts[s.session_type] !== undefined) counts[s.session_type]++ })
  const max = Math.max(...Object.values(counts), 1)
  const data = types.map((t) => ({
    subject: t.charAt(0).toUpperCase() + t.slice(1),
    A: Math.round((counts[t] / max) * 100),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(0,0,0,0.06)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#6B6B6B", fontSize: 10 }} />
        <Radar dataKey="A" stroke="#2D4A3E" fill="#2D4A3E" fillOpacity={0.2} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

function FeelingChart({ sessions }: { sessions: Partial<Session>[] }) {
  const data = sessions.filter((s) => s.feeling).slice(-15).map((s) => ({
    date: format(new Date(s.date!), "d MMM", { locale: fr }),
    feeling: s.feeling,
    motivation: s.motivation,
    confiance: s.confidence,
  }))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fill: "#6B6B6B", fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis domain={[1, 5]} tick={{ fill: "#6B6B6B", fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", color: "#1A1A1A", fontSize: 11, borderRadius: 12 }} />
        <Line dataKey="feeling" stroke="#2D4A3E" strokeWidth={2.5} dot={false} name="Ressenti" />
        <Line dataKey="motivation" stroke="#E8C840" strokeWidth={2} dot={false} name="Motivation" strokeDasharray="4 2" />
        <Line dataKey="confiance" stroke="#A8A89A" strokeWidth={2} dot={false} name="Confiance" strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  )
}

function MatchResultsPie({ matches }: { matches: Partial<Match>[] }) {
  const wins = matches.filter((m) => m.result === "win").length
  const losses = matches.filter((m) => m.result === "loss").length
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <PieChart width={100} height={100}>
          <Pie data={[{ value: wins }, { value: losses }]} cx={45} cy={45} innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
            <Cell fill="#2D4A3E" />
            <Cell fill="#C8352A" />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif font-bold text-lg text-ppp-text">{winRate}%</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-ppp-forest" />
          <span className="text-sm font-serif text-ppp-text"><strong>{wins}</strong> victoire{wins > 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red" />
          <span className="text-sm font-serif text-ppp-text"><strong>{losses}</strong> défaite{losses > 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  )
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
      if (!user) { setLoading(false); return }
      const [sessRes, matchRes] = await Promise.all([
        supabase.from("sessions").select("*").eq("player_id", user.id).order("date", { ascending: false }),
        supabase.from("matches").select("*").eq("player_id", user.id).order("date", { ascending: false }),
      ])
      setSessions(sessRes.data?.length ? sessRes.data : demoSessions as Session[])
      setMatches(matchRes.data?.length ? matchRes.data : demoMatches as Match[])
      setLoading(false)
    }
    load()
  }, [supabase])

  const filterDate = () => {
    const now = new Date()
    if (filter === "week") { const d = new Date(now); d.setDate(d.getDate() - 7); return d }
    if (filter === "month") { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d }
    if (filter === "season") { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d }
    return new Date(0)
  }

  const cutoff = filterDate()
  const filteredSessions = sessions.filter((s) => new Date(s.date!) >= cutoff)
  const filteredMatches = matches.filter((m) => new Date(m.date!) >= cutoff)

  const totalHours = Math.round(filteredSessions.reduce((acc, s) => acc + (s.duration_min || 0), 0) / 60 * 10) / 10
  const wins = filteredMatches.filter((m) => m.result === "win").length
  const winRate = filteredMatches.length > 0 ? Math.round((wins / filteredMatches.length) * 100) : 0
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

  return (
    <>
      <TopBar title="Statistiques" />
      <PageWrapper>
        {/* Pill filters */}
        <div className="flex gap-2 pt-4 pb-5 overflow-x-auto no-scrollbar">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 text-xs font-semibold font-serif uppercase tracking-[0.08em] flex-shrink-0 rounded-full transition-all ${
                filter === f.value
                  ? "bg-ppp-forest text-white shadow-sm"
                  : "bg-white border border-gray-200 text-ppp-muted hover:border-ppp-forest hover:text-ppp-forest"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl h-28" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-2">⏱</div>
                <div className="font-serif font-bold text-4xl leading-none text-ppp-text">{totalHours}<span className="text-xl">h</span></div>
                <div className="text-[10px] text-ppp-muted uppercase tracking-[0.12em] font-serif mt-2">Temps de jeu</div>
                <div className="text-xs text-ppp-muted font-serif">{filteredSessions.length} séances</div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-serif font-bold text-4xl leading-none" style={{ color: winRate >= 50 ? "#2D4A3E" : "#C8352A" }}>
                  {winRate}<span className="text-xl">%</span>
                </div>
                <div className="text-[10px] text-ppp-muted uppercase tracking-[0.12em] font-serif mt-2">Win rate</div>
                <div className="text-xs text-ppp-muted font-serif">{filteredMatches.length} matchs</div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-2">🏓</div>
                <div className="font-serif font-bold text-4xl leading-none text-ppp-text">{filteredSessions.length}</div>
                <div className="text-[10px] text-ppp-muted uppercase tracking-[0.12em] font-serif mt-2">Séances</div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-2">🔥</div>
                <div className="font-serif font-bold text-4xl leading-none" style={{ color: streak > 0 ? "#E8C840" : "#6B6B6B" }}>
                  {streak}<span className="text-xl">j</span>
                </div>
                <div className="text-[10px] text-ppp-muted uppercase tracking-[0.12em] font-serif mt-2">Série actuelle</div>
              </div>
            </div>

            <ChartCard title="Heures par semaine">
              <WeeklyHoursChart sessions={sessions} />
            </ChartCard>

            <ChartCard title="Répartition des séances">
              <SessionTypeRadar sessions={filteredSessions} />
            </ChartCard>

            {filteredSessions.some((s) => s.feeling) && (
              <ChartCard title="Forme & motivation">
                <div className="flex gap-4 mb-3">
                  <span className="flex items-center gap-1.5 text-[9px] text-ppp-forest uppercase tracking-wide font-serif font-semibold">● Ressenti</span>
                  <span className="flex items-center gap-1.5 text-[9px] text-yellow uppercase tracking-wide font-serif font-semibold">● Motivation</span>
                  <span className="flex items-center gap-1.5 text-[9px] text-ppp-muted uppercase tracking-wide font-serif font-semibold">● Confiance</span>
                </div>
                <FeelingChart sessions={filteredSessions} />
              </ChartCard>
            )}

            {filteredMatches.length > 0 && (
              <ChartCard title="Résultats matchs">
                <MatchResultsPie matches={filteredMatches} />
              </ChartCard>
            )}

            {/* Bilan */}
            <div className="bg-ppp-forest/5 border border-ppp-forest/15 rounded-2xl p-5">
              <div className="text-[10px] text-ppp-forest uppercase tracking-[0.14em] font-serif font-semibold mb-2">Bilan de période</div>
              <p className="text-sm text-ppp-text/80 font-serif leading-relaxed">
                {filter === "week" ? "Sur 7 jours" : filter === "month" ? "Sur 30 jours" : filter === "season" ? "Sur 6 mois" : "Au total"}, tu as joué{" "}
                <strong>{totalHours}h</strong> en <strong>{filteredSessions.length} séances</strong>.{" "}
                {filteredMatches.length > 0 && (
                  <>Win rate : <span className={`font-semibold ${winRate >= 50 ? "text-ppp-forest" : "text-red"}`}>{winRate}%</span> sur {filteredMatches.length} matchs. </>
                )}
                {streak > 2 && <span className="text-yellow font-semibold">🔥 {streak} jours de suite !</span>}
              </p>
            </div>
          </div>
        )}
      </PageWrapper>
    </>
  )
}
