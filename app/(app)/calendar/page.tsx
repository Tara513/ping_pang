"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, addMonths, subMonths, isToday,
} from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { demoSessions, demoMatches } from "@/lib/seeds/demoData"
import type { Session, Match } from "@/types/database"

const TYPE_COLORS: Record<string, string> = {
  technique: "#4A5240", physique: "#8A9178", match: "#C8352A",
  service: "#E8C840", competition: "#E8C840", chill: "#2A2A2A",
}
const TYPE_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill",
}

export default function CalendarPage() {
  const supabase = createClient()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [sessions, setSessions] = useState<Partial<Session>[]>([])
  const [matches, setMatches] = useState<Partial<Match>[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [sessRes, matchRes] = await Promise.all([
        supabase.from("sessions").select("*").eq("player_id", user.id),
        supabase.from("matches").select("*").eq("player_id", user.id),
      ])
      setSessions(sessRes.data?.length ? sessRes.data : demoSessions as Session[])
      setMatches(matchRes.data?.length ? matchRes.data : demoMatches as Match[])
      setLoading(false)
    }
    load()
  }, [supabase])

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const firstDayOfWeek = (getDay(startOfMonth(currentMonth)) + 6) % 7

  const getDaySessions = (day: Date) => sessions.filter(s => s.date && isSameDay(new Date(s.date), day))
  const getDayMatches = (day: Date) => matches.filter(m => m.date && isSameDay(new Date(m.date), day))

  const selSessions = selectedDay ? getDaySessions(selectedDay) : []
  const selMatches = selectedDay ? getDayMatches(selectedDay) : []

  const monthTotal = days.reduce((acc, d) => {
    return acc + getDaySessions(d).reduce((a, s) => a + (s.duration_min || 0), 0)
  }, 0)

  return (
    <>
      <TopBar title="Calendrier" />
      <PageWrapper>
        <div className="pt-4 flex flex-col gap-4">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 text-sage hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <div className="font-display text-2xl font-light text-white">
                {format(currentMonth, "MMMM yyyy", { locale: fr })}
              </div>
              {monthTotal > 0 && (
                <div className="text-[10px] text-sage">{Math.round(monthTotal / 60 * 10) / 10}h ce mois</div>
              )}
            </div>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 text-sage hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-sage uppercase font-semibold py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="grid grid-cols-7 gap-0.5 animate-pulse">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square bg-surface" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map((day) => {
                const daySessions = getDaySessions(day)
                const dayMatches = getDayMatches(day)
                const hasActivity = daySessions.length > 0 || dayMatches.length > 0
                const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
                const today = isToday(day)
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`aspect-square flex flex-col items-center justify-center gap-0.5 border transition-all ${
                      isSelected ? "border-green bg-green/20" :
                      today ? "border-white/40" :
                      hasActivity ? "border-white/10 hover:border-white/20" : "border-transparent"
                    }`}
                  >
                    <span className={`text-xs font-semibold ${today ? "text-sand" : hasActivity ? "text-white" : "text-sage/50"}`}>
                      {format(day, "d")}
                    </span>
                    {hasActivity && (
                      <div className="flex gap-0.5">
                        {daySessions.slice(0, 2).map((s, i) => (
                          <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: TYPE_COLORS[s.session_type as string] || "#4A5240" }} />
                        ))}
                        {dayMatches.slice(0, 1).map((_, i) => (
                          <div key={`m${i}`} className="w-1 h-1 rounded-full bg-red" />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-4 flex-wrap">
            {[
              { color: "#4A5240", label: "Technique" },
              { color: "#8A9178", label: "Physique" },
              { color: "#C8352A", label: "Match" },
              { color: "#E8C840", label: "Service" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-sage">{label}</span>
              </div>
            ))}
          </div>

          {/* Selected day */}
          {selectedDay && (
            <div className="flex flex-col gap-2">
              <div className="text-[10px] text-sage uppercase tracking-wider font-semibold">
                {format(selectedDay, "EEEE d MMMM", { locale: fr })}
              </div>
              {selSessions.length === 0 && selMatches.length === 0 && (
                <div className="text-center py-4 text-sage text-sm">Aucune activité ce jour-là</div>
              )}
              {selSessions.map((s, i) => (
                <div key={i} className="bg-surface border border-white/[0.08] p-3 flex items-center gap-3">
                  <div className="w-1 h-10 flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[s.session_type as string] || "#4A5240" }} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{TYPE_LABELS[s.session_type as string] || s.session_type}</div>
                    <div className="text-xs text-sage">{s.duration_min} min{s.location ? ` · ${s.location}` : ""}</div>
                  </div>
                  {s.feeling && <span className="text-xl">{["", "😤", "😕", "😐", "😊", "🤩"][s.feeling]}</span>}
                </div>
              ))}
              {selMatches.map((m, i) => (
                <div key={i} className="bg-surface border border-white/[0.08] p-3 flex items-center gap-3">
                  <div className="w-1 h-10 flex-shrink-0 bg-red" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">Match vs {m.opponent_name}</div>
                    <div className={`text-xs ${m.result === "win" ? "text-green-light" : "text-red"}`}>
                      {m.result === "win" ? "Victoire" : "Défaite"} · {m.sets_won}-{m.sets_lost}
                    </div>
                  </div>
                  <span>{m.result === "win" ? "✓" : "✗"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  )
}
