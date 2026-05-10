"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Flame, ChevronRight, Clock, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import Avatar from "@/components/ui/Avatar"
import PageWrapper from "@/components/layout/PageWrapper"
import type { Profile, Session, Match } from "@/types/database"
import { SESSION_TYPE_COLORS } from "@/types/app"
import { formatDistanceToNow, format } from "date-fns"
import { fr } from "date-fns/locale"
import { demoSessions, demoMatches } from "@/lib/seeds/demoData"

interface FeedEntry {
  id: string
  type: "session" | "match"
  data: Session | Match
  profile: Profile
}

const SESSION_ICONS: Record<string, string> = {
  technique: "🏓", physique: "💪", match: "⚔️", service: "🎯", competition: "🏆", chill: "😎"
}
const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill"
}
const MATCH_LABELS: Record<string, string> = {
  friendly: "Amical", league: "Championnat", tournament: "Tournoi", training: "Entraînement"
}

// ─── Week Summary ────────────────────────────────────────────────────────────

function WeekSummary({ sessions, targetHours }: { sessions: Partial<Session>[]; targetHours: number }) {
  const thisWeek = sessions.filter((s) => {
    const d = new Date(s.date!)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)
    return d >= weekStart
  })

  const totalMins = thisWeek.reduce((acc, s) => acc + (s.duration_min || 0), 0)
  const totalHours = Math.round(totalMins / 60 * 10) / 10
  const progress = Math.min((totalHours / targetHours) * 100, 100)
  const types = ["technique", "physique", "match", "service", "competition", "chill"]
  const typeDone = new Set(thisWeek.map((s) => s.session_type))

  return (
    <div className="bg-ppp-forest rounded-2xl p-5 text-ppp-white">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[9px] text-ppp-white/50 uppercase tracking-[0.18em] font-serif mb-1">Cette semaine</div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif font-bold text-5xl leading-none">{totalHours}</span>
            <span className="text-ppp-white/60 text-base font-serif">h</span>
            <span className="text-ppp-white/40 text-sm font-serif">/ {targetHours}h</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 text-yellow">
            <Flame size={18} />
            <span className="font-serif font-bold text-2xl leading-none">{thisWeek.length}</span>
          </div>
          <span className="text-[9px] text-ppp-white/40 uppercase tracking-wider font-serif">séances</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-ppp-white/15 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-ppp-white rounded-full"
        />
      </div>

      {/* Session type pills */}
      <div className="flex gap-1.5 flex-wrap">
        {types.map((t) => {
          const done = typeDone.has(t as Session["session_type"])
          return (
            <span
              key={t}
              className={`text-[9px] font-serif uppercase tracking-wide px-2.5 py-1 rounded-full transition-all ${
                done
                  ? "bg-ppp-white/20 text-ppp-white"
                  : "text-ppp-white/25"
              }`}
            >
              {done && "✓ "}{SESSION_LABELS[t]}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ─── Feed Item ───────────────────────────────────────────────────────────────

function FeedItem({ entry }: { entry: FeedEntry }) {
  const isSession = entry.type === "session"
  const s = entry.data as Session
  const m = entry.data as Match

  const typeLabel = isSession ? SESSION_LABELS[s.session_type] || s.session_type : MATCH_LABELS[m.match_type] || m.match_type
  const typeColor = isSession ? SESSION_TYPE_COLORS[s.session_type] || "#2D4A3E" : m.result === "win" ? "#2D4A3E" : "#C8352A"
  const icon = isSession ? SESSION_ICONS[s.session_type] : "⚔️"
  const dateStr = formatDistanceToNow(new Date(entry.data.date), { addSuffix: true, locale: fr })
  const duration = isSession ? Math.round((s.duration_min || 0) / 60 * 10) / 10 : null

  return (
    <Link href={isSession ? `/session/${entry.data.id}` : `/match/${entry.data.id}`}>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer">
        {/* Top row: type badge + date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-serif font-semibold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: typeColor }}
            >
              {icon} {typeLabel}
            </span>
            {!isSession && m.result && (
              <span className={`text-[10px] font-serif font-semibold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full text-white ${m.result === "win" ? "bg-ppp-forest" : "bg-red"}`}>
                {m.result === "win" ? "Victoire" : "Défaite"}
              </span>
            )}
          </div>
          <span className="text-[10px] text-ppp-muted font-serif">{dateStr}</span>
        </div>

        {/* Main info */}
        <div className="flex items-center gap-3">
          <Avatar src={entry.profile.avatar_url} name={entry.profile.full_name} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="font-serif font-semibold text-sm text-ppp-text">
              {entry.profile.full_name || entry.profile.username}
            </div>
            {isSession && s.location && (
              <div className="flex items-center gap-1 text-xs text-ppp-muted font-serif mt-0.5">
                <MapPin size={10} />
                {s.location}
              </div>
            )}
            {!isSession && (
              <div className="text-xs text-ppp-muted font-serif mt-0.5">
                vs {m.opponent_name}
                {m.sets_won !== null && ` · ${m.sets_won}–${m.sets_lost}`}
              </div>
            )}
          </div>
          <ChevronRight size={16} className="text-ppp-muted/40 shrink-0" />
        </div>

        {/* Stats row */}
        {isSession && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
            {duration !== null && (
              <div className="flex items-center gap-1.5 text-xs text-ppp-muted font-serif">
                <Clock size={12} />
                <span className="font-semibold text-ppp-text">{duration}h</span>
              </div>
            )}
            {s.feeling && (
              <div className="flex items-center gap-1 text-xs text-ppp-muted font-serif">
                <span>{"⭐".repeat(Math.min(s.feeling, 5))}</span>
              </div>
            )}
            {s.exercises && Array.isArray(s.exercises) && s.exercises.length > 0 && (
              <span className="text-xs text-ppp-muted font-serif">{s.exercises.length} exercice{s.exercises.length > 1 ? "s" : ""}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<Partial<Session>[]>([])
  const [matches, setMatches] = useState<Partial<Match>[]>([])
  const [targetHours, setTargetHours] = useState(5)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [profileRes, sessionsRes, matchesRes, goalRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("sessions").select("*").eq("player_id", user.id).order("date", { ascending: false }).limit(20),
        supabase.from("matches").select("*").eq("player_id", user.id).order("date", { ascending: false }).limit(10),
        supabase.from("weekly_goals").select("*").eq("player_id", user.id).order("week_start", { ascending: false }).limit(1),
      ])

      setProfile(profileRes.data)
      setSessions(sessionsRes.data?.length ? sessionsRes.data : demoSessions as Session[])
      setMatches(matchesRes.data?.length ? matchesRes.data : demoMatches as Match[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (goalRes.data?.[0]) setTargetHours((goalRes.data[0] as any).target_hours || 5)
      setLoading(false)
    }
    load()
  }, [supabase])

  const feedEntries: FeedEntry[] = [
    ...sessions.slice(0, 6).map((s) => ({
      id: `s-${s.id || Math.random()}`,
      type: "session" as const,
      data: s as Session,
      profile: profile || { id: "demo", username: "moi", full_name: "Moi", avatar_url: null } as Profile,
    })),
    ...matches.slice(0, 4).map((m) => ({
      id: `m-${m.id || Math.random()}`,
      type: "match" as const,
      data: m as Match,
      profile: profile || { id: "demo", username: "moi", full_name: "Moi", avatar_url: null } as Profile,
    })),
  ].sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())

  const firstName = profile?.full_name?.split(" ")[0] || profile?.username || "joueur"
  const today = format(new Date(), "EEEE d MMMM", { locale: fr })

  return (
    <PageWrapper>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between pt-10 pb-6"
      >
        <div>
          <div className="text-[10px] text-ppp-muted uppercase tracking-[0.16em] font-serif capitalize">{today}</div>
          <div className="font-serif font-bold text-[2.6rem] text-ppp-text uppercase leading-[0.95] mt-1">
            {firstName}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Link href="/profile" className="relative text-ppp-muted hover:text-ppp-text transition-colors p-1">
            <Bell size={20} strokeWidth={1.5} />
          </Link>
          <Link href="/profile">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
          </Link>
        </div>
      </motion.div>

      {/* ── Week Summary ── */}
      {!loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <WeekSummary sessions={sessions} targetHours={targetHours} />
        </motion.div>
      )}

      {/* ── Feed ── */}
      <div className="mt-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-xl text-ppp-text uppercase tracking-[0.04em]">Activité récente</h2>
          <Link href="/stats" className="text-[10px] text-ppp-muted hover:text-ppp-forest transition-colors uppercase tracking-[0.1em] font-serif flex items-center gap-1">
            Tout voir <ChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : feedEntries.length > 0 ? (
          <div className="flex flex-col gap-3">
            {feedEntries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
              >
                <FeedItem entry={entry} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4">🏓</div>
            <div className="font-serif font-bold text-xl text-ppp-text uppercase mb-1">C&apos;est parti !</div>
            <div className="text-ppp-muted text-sm font-serif">Enregistre ta première séance</div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
