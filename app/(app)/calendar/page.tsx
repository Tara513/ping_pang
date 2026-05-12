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

const SESSION_COLORS: Record<string, string> = {
  technique: "#1A5C4A", physique: "#7A9E8E", match: "#C72927",
  service: "#D4C9B5", competition: "#D4C9B5", chill: "#2A2A2A",
}
const SESSION_LABELS: Record<string, string> = {
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

  const getDaySessions = (day: Date) => sessions.filter((s) => s.date && isSameDay(new Date(s.date), day))
  const getDayMatches = (day: Date) => matches.filter((m) => m.date && isSameDay(new Date(m.date), day))

  const selSessions = selectedDay ? getDaySessions(selectedDay) : []
  const selMatches = selectedDay ? getDayMatches(selectedDay) : []

  const monthTotalMin = days.reduce((acc, d) => acc + getDaySessions(d).reduce((a, s) => a + (s.duration_min || 0), 0), 0)
  const monthSessions = days.reduce((acc, d) => acc + getDaySessions(d).length, 0)

  return (
    <>
      <TopBar title="Calendrier" />
      <PageWrapper noPadding>
        {/* Month navigation */}
        <div className="flex items-center px-4 pt-6 pb-4">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-2 text-sage hover:text-white transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <div className="flex-1 text-center">
            <div className="font-display font-light text-white text-3xl capitalize">
              {format(currentMonth, "MMMM", { locale: fr })}
            </div>
            <div className="text-[10px] text-sage uppercase tracking-[0.2em] mt-0.5">
              {format(currentMonth, "yyyy")}
            </div>
          </div>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2 text-sage hover:text-white transition-colors"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Month stats */}
        {monthSessions > 0 && (
          <div className="flex px-4 pb-4 gap-6">
            <div>
              <div className="font-display text-2xl font-light text-white">{monthSessions}</div>
              <div className="text-[9px] text-sage uppercase tracking-widest">séances</div>
            </div>
            <div>
              <div className="font-display text-2xl font-light text-white">
                {Math.round(monthTotalMin / 60 * 10) / 10}h
              </div>
              <div className="text-[9px] text-sage uppercase tracking-widest">ce mois</div>
            </div>
          </div>
        )}

        <div className="border-t border-white/[0.06]" />

        {/* Day headers */}
        <div className="grid grid-cols-7 px-1 pt-3 pb-1">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} className="text-center text-[9px] text-sage/50 uppercase tracking-widest py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="grid grid-cols-7 px-1 gap-0.5 animate-pulse">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square bg-surface/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 px-1 gap-0.5">
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
                  className={`aspect-square flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected ? "bg-surface" : today ? "bg-white/[0.04]" : ""
                  }`}
                >
                  <span className={`text-[12px] font-sans transition-colors ${
                    today ? "text-sand" : hasActivity ? "text-white" : "text-sage/30"
                  }`}>
                    {format(day, "d")}
                  </span>
                  {hasActivity && (
                    <div className="flex gap-[2px] items-center">
                      {daySessions.slice(0, 2).map((s, i) => (
                        <div
                          key={i}
                          className="w-[5px] h-[5px]"
                          style={{ backgroundColor: SESSION_COLORS[s.session_type as string] || "#1A5C4A" }}
                        />
                      ))}
                      {dayMatches.slice(0, 1).map((_, i) => (
                        <div key={`m${i}`} className="w-[5px] h-[5px] bg-red" />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-5 px-4 pt-4 pb-2">
          {[
            { color: "#1A5C4A", label: "Technique" },
            { color: "#7A9E8E", label: "Physique" },
            { color: "#C72927", label: "Match" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-[5px] h-[5px]" style={{ backgroundColor: color }} />
              <span className="text-[9px] text-sage uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>

        {/* Selected day detail */}
        {selectedDay && (
          <div className="border-t border-white/[0.06] mt-2">
            <div className="px-4 py-4">
              <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-4 capitalize">
                {format(selectedDay, "EEEE d MMMM", { locale: fr })}
              </div>
              {selSessions.length === 0 && selMatches.length === 0 && (
                <div className="text-center py-6">
                  <div className="text-[10px] text-sage/50 uppercase tracking-[0.2em]">Aucune activité</div>
                </div>
              )}
              {selSessions.map((s, i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b border-white/[0.05]">
                  <div className="w-[3px] self-stretch flex-shrink-0" style={{ backgroundColor: SESSION_COLORS[s.session_type as string] || "#1A5C4A" }} />
                  <div className="flex-1">
                    <div className="text-[9px] text-sage uppercase tracking-[0.2em]">
                      {SESSION_LABELS[s.session_type as string] || s.session_type}
                    </div>
                    <div className="font-display text-xl font-light text-white">
                      {s.duration_min}min{s.location ? ` · ${s.location}` : ""}
                    </div>
                  </div>
                  {s.feeling && (
                    <span className="text-2xl">{["", "😤", "😕", "😐", "😊", "🤩"][s.feeling]}</span>
                  )}
                </div>
              ))}
              {selMatches.map((m, i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b border-white/[0.05]">
                  <div className={`w-[3px] self-stretch flex-shrink-0 ${m.result === "win" ? "bg-green-light" : "bg-red"}`} />
                  <div className="flex-1">
                    <div className="text-[9px] text-sage uppercase tracking-[0.2em]">Match</div>
                    <div className="font-display text-xl font-light text-white">vs {m.opponent_name}</div>
                  </div>
                  <div className={`text-[9px] uppercase tracking-widest ${m.result === "win" ? "text-green-light" : "text-red"}`}>
                    {m.result === "win" ? "W" : "L"} {m.sets_won}–{m.sets_lost}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageWrapper>
    </>
  )
}
