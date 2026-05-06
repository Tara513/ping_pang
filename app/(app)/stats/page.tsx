"use client"

export const dynamic = "force-dynamic"


import { useEffect, useState } from "react"
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import StatCard from "@/components/ui/StatCard"
import Card from "@/components/ui/Card"
import type { Session, Match } from "@/types/database"
import { demoSessions, demoMatches } from "@/lib/seeds/demoData"
import { Flame } from "lucide-react"
import { format, startOfWeek, eachWeekOfInterval, subMonths } from "date-fns"
import { fr } from "date-fns/locale"

const FILTER_OPTIONS = [
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "season", label: "Saison" },
  { value: "all", label: "Tout" },
]

const SESSION_TYPE_COLORS: Record<string, string> = {
  technique: "#4A5240", physique: "#8A9178", match: "#C8352A",
  service: "#E8C840", competition: "#E8C840", chill: "#2A2A2A"
}

function WeeklyHoursChart({ sessions }: { sessions: Partial<Session>[] }) {
  const weeks = eachWeekOfInterval({
    start: subMonths(new Date(), 3),
    end: new Date(),
  }, { weekStartsOn: 1 })

  const data = weeks.slice(-10).map((weekStart) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.date!)
      return d >= weekStart && d < weekEnd
    })
    const hours = weekSessions.reduce((acc, s) => acc + (s.duration_min || 0), 0) / 60
    return {
      week: format(weekStart, "d MMM", { locale: fr }),
      heures: Math.round(hours * 10) / 10,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="week" tick={{ fill: "#8A9178", fontSize: 9 }} />
        <YAxis tick={{ fill: "#8A9178", fontSize: 9 }} />
        <Tooltip
          contentStyle={{ background: "#2A2A2A", border: "none", color: "#F5F2EC", fontSize: 11 }}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="heures" fill="#4A5240" name="Heures" radius={[0, 0, 0, 0]} />
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
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#8A9178", fontSize: 10 }} />
        <Radar dataKey="A" stroke="#4A5240" fill="#4A5240" fillOpacity={0.4} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

function FeelingChart({ sessions }: { sessions: Partial<Session>[] }) {
  const data = sessions
    .filter((s) => s.feeling)
    .slice(-15)
    .map((s) => ({
      date: format(new Date(s.date!), "d MMM", { locale: fr }),
      feeling: s.feeling,
      motivation: s.motivation,
      confiance: s.confidence,
    }))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: "#8A9178", fontSize: 9 }} />
        <YAxis domain={[1, 5]} tick={{ fill: "#8A9178", fontSize: 9 }} />
        <Tooltip
          contentStyle={{ background: "#2A2A2A", border: "none", color: "#F5F2EC", fontSize: 11 }}
        />
        <Line dataKey="feeling" stroke="#4A5240" strokeWidth={2} dot={false} name="Ressenti" />
        <Line dataKey="motivation" stroke="#E8C840" strokeWidth={2} dot={false} name="Motivation" />
        <Line dataKey="confiance" stroke="#8A9178" strokeWidth={2} dot={false} name="Confiance" />
      </LineChart>
    </ResponsiveContainer>
  )
}

function MatchResultsPie({ matches }: { matches: Partial<Match>[] }) {
  const wins = matches.filter((m) => m.result === "win").length
  const losses = matches.filter((m) => m.result === "loss").length
  const data = [
    { name: "Victoires", value: wins },
    { name: "Défaites", value: losses },
  ]

  return (
    <div className="flex items-center gap-4">
      <PieChart width={100} height={100}>
        <Pie data={data} cx={45} cy={45} innerRadius={25} outerRadius={45} dataKey="value" strokeWidth={0}>
          <Cell fill="#4A5240" />
          <Cell fill="#C8352A" />
        </Pie>
      </PieChart>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-kaki" />
          <span className="text-sm text-white">{wins} victoires</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red" />
          <span className="text-sm text-white">{losses} défaites</span>
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
      if (!user) return

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
        {/* Filtres */}
        <div className="flex gap-2 pt-4 pb-4 overflow-x-auto no-scrollbar">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide flex-shrink-0 border transition-all ${
                filter === f.value
                  ? "bg-white text-black border-white"
                  : "border-white/20 text-olive hover:border-white/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-anthracite border border-white/[0.08] h-24" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Heures totales" value={`${totalHours}h`} sub={`${filteredSessions.length} séances`} />
              <StatCard label="Win rate" value={`${winRate}%`} sub={`${filteredMatches.length} matchs`} color={winRate >= 50 ? "#4A5240" : "#C8352A"} />
              <StatCard label="Séances" value={filteredSessions.length} />
              <StatCard label="Série" value={`${streak}j`} color="#E8C840" />
            </div>

            {/* Charts */}
            <Card>
              <div className="text-[10px] text-olive uppercase tracking-wider mb-3 font-semibold">Heures par semaine</div>
              <WeeklyHoursChart sessions={sessions} />
            </Card>

            <Card>
              <div className="text-[10px] text-olive uppercase tracking-wider mb-3 font-semibold">Répartition des séances</div>
              <SessionTypeRadar sessions={filteredSessions} />
            </Card>

            {filteredSessions.some((s) => s.feeling) && (
              <Card>
                <div className="flex gap-4 mb-2">
                  <span className="flex items-center gap-1 text-[10px] text-kaki uppercase">● Ressenti</span>
                  <span className="flex items-center gap-1 text-[10px] text-yellow uppercase">● Motivation</span>
                  <span className="flex items-center gap-1 text-[10px] text-olive uppercase">● Confiance</span>
                </div>
                <FeelingChart sessions={filteredSessions} />
              </Card>
            )}

            {filteredMatches.length > 0 && (
              <Card>
                <div className="text-[10px] text-olive uppercase tracking-wider mb-3 font-semibold">Résultats matchs</div>
                <MatchResultsPie matches={filteredMatches} />
              </Card>
            )}

            {/* Résumé textuel */}
            <Card className="border-kaki/30">
              <div className="text-[10px] text-kaki uppercase tracking-wider mb-2 font-semibold">Bilan de période</div>
              <p className="text-sm text-white/80 leading-relaxed">
                {filter === "week" ? "Cette semaine" : filter === "month" ? "Ce mois" : filter === "season" ? "Cette saison" : "Au total"}, tu as joué{" "}
                <span className="text-white font-semibold">{totalHours}h</span> en{" "}
                <span className="text-white font-semibold">{filteredSessions.length} séances</span>.{" "}
                {filteredMatches.length > 0 && (
                  <>Ton win rate est de <span className={`font-semibold ${winRate >= 50 ? "text-kaki" : "text-red"}`}>{winRate}%</span> sur {filteredMatches.length} matchs. </>
                )}
                {streak > 2 && <span className="text-yellow inline-flex items-center gap-1"><Flame size={13} fill="currentColor" strokeWidth={0} /> Tu es sur une série de {streak} jours !</span>}
              </p>
            </Card>
          </div>
        )}
      </PageWrapper>
    </>
  )
}
