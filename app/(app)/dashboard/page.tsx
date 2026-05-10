"use client"

export const dynamic = "force-dynamic"


import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Flame } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import Avatar from "@/components/ui/Avatar"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import PageWrapper from "@/components/layout/PageWrapper"
import type { Profile, Session, Match } from "@/types/database"
import { SESSION_TYPE_COLORS } from "@/types/app"
import { formatDistanceToNow } from "date-fns"
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
    <Card featured className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-ppp-white/60 uppercase tracking-widest font-semibold mb-1">Cette semaine</div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-5xl text-ppp-white leading-none">{totalHours}h</span>
            <span className="text-ppp-white/60 text-sm">/ {targetHours}h objectif</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-yellow">
          <Flame size={22} />
          <span className="font-serif font-bold text-3xl leading-none">{thisWeek.length}</span>
        </div>
      </div>

      <div className="h-0.5 bg-ppp-white/20">
        <div
          className="h-full bg-ppp-white transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {types.map((t) => (
          <span
            key={t}
            className={`text-[10px] font-semibold uppercase px-2 py-1 border transition-all rounded-sm ${
              typeDone.has(t as Session["session_type"])
                ? "bg-ppp-white/20 border-ppp-white/40 text-ppp-white"
                : "border-ppp-white/20 text-ppp-white/30"
            }`}
          >
            {typeDone.has(t as Session["session_type"]) ? "✓ " : ""}{SESSION_LABELS[t]}
          </span>
        ))}
      </div>
    </Card>
  )
}

function FeedItem({ entry }: { entry: FeedEntry }) {
  const isSession = entry.type === "session"
  const s = entry.data as Session
  const m = entry.data as Match

  const typeLabel = isSession
    ? SESSION_LABELS[s.session_type] || s.session_type
    : MATCH_LABELS[m.match_type] || m.match_type
  const typeColor = isSession
    ? SESSION_TYPE_COLORS[s.session_type] || "#2D4A3E"
    : m.result === "win" ? "#2D4A3E" : "#C8352A"
  const icon = isSession ? SESSION_ICONS[s.session_type] : "⚔️"
  const dateStr = formatDistanceToNow(new Date(entry.data.date), { addSuffix: true, locale: fr })

  return (
    <Link href={isSession ? `/session/${entry.data.id}` : `/match/${entry.data.id}`}>
      <Card className="hover:border-ppp-text/20 transition-all active:scale-[0.99] cursor-pointer">
        <div className="flex gap-3 items-start">
          <Avatar src={entry.profile.avatar_url} name={entry.profile.full_name} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-ppp-text">
                {entry.profile.full_name || entry.profile.username}
              </span>
              <span
                className="text-[10px] font-semibold uppercase px-2 py-0.5 text-ppp-white rounded-sm"
                style={{ backgroundColor: typeColor }}
              >
                {icon} {typeLabel}
              </span>
              {!isSession && m.result && (
                <Badge
                  label={m.result === "win" ? "Victoire" : "Défaite"}
                  color={m.result === "win" ? "forest" : "red"}
                />
              )}
            </div>
            <div className="text-ppp-muted text-xs mt-1">{dateStr}</div>

            {isSession && (
              <div className="flex items-center gap-3 mt-2 text-xs text-ppp-muted">
                <span>{Math.round((s.duration_min || 0) / 60 * 10) / 10}h</span>
                {s.feeling && <span>{"⭐".repeat(s.feeling)}</span>}
                {s.location && <span>📍 {s.location}</span>}
              </div>
            )}

            {!isSession && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-ppp-muted">{m.opponent_name}</span>
                {m.sets_won !== null && (
                  <span className={m.result === "win" ? "text-ppp-forest font-semibold" : "text-red font-semibold"}>
                    {m.sets_won}-{m.sets_lost}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

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
      if (!user) return

      const [profileRes, sessionsRes, matchesRes, goalRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("sessions").select("*").eq("player_id", user.id).order("date", { ascending: false }).limit(20),
        supabase.from("matches").select("*").eq("player_id", user.id).order("date", { ascending: false }).limit(10),
        supabase.from("weekly_goals").select("*").eq("player_id", user.id).order("week_start", { ascending: false }).limit(1),
      ])

      const profileData = profileRes.data
      const allSessions = sessionsRes.data?.length ? sessionsRes.data : demoSessions as Session[]
      const allMatches = matchesRes.data?.length ? matchesRes.data : demoMatches as Match[]

      setProfile(profileData)
      setSessions(allSessions)
      setMatches(allMatches)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (goalRes.data?.[0]) setTargetHours((goalRes.data[0] as any).target_hours || 5)
      setLoading(false)
    }
    load()
  }, [supabase])

  const feedEntries: FeedEntry[] = [
    ...sessions.slice(0, 5).map((s) => ({
      id: `s-${s.id || Math.random()}`,
      type: "session" as const,
      data: s as Session,
      profile: profile || { id: "demo", username: "moi", full_name: "Moi", avatar_url: null } as Profile,
    })),
    ...matches.slice(0, 3).map((m) => ({
      id: `m-${m.id || Math.random()}`,
      type: "match" as const,
      data: m as Match,
      profile: profile || { id: "demo", username: "moi", full_name: "Moi", avatar_url: null } as Profile,
    })),
  ].sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())

  const firstName = profile?.full_name?.split(" ")[0] || profile?.username || "joueur"

  return (
    <PageWrapper>
      {/* Header PPP */}
      <div className="pt-10 pb-7">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <div className="text-[9px] text-ppp-muted uppercase tracking-[0.2em] font-serif mb-1">Bonjour</div>
            <div className="font-serif font-bold text-[2.8rem] text-ppp-text uppercase leading-[0.92] tracking-[0.02em]">
              {firstName}
            </div>
            <div className="mt-2 h-px w-12 bg-ppp-forest" />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Link href="/profile" className="text-ppp-muted hover:text-ppp-text transition-colors">
              <Bell size={20} strokeWidth={1.5} />
            </Link>
            <Link href="/profile">
              <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Week summary */}
      {!loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <WeekSummary sessions={sessions} targetHours={targetHours} />
        </motion.div>
      )}

      {/* Feed */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-2xl text-ppp-text uppercase">Activité récente</h2>
          <Link href="/stats" className="text-xs text-ppp-muted hover:text-ppp-text transition-colors uppercase tracking-wide">
            Tout voir
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-ppp-card border border-ppp-border p-4 animate-pulse rounded-md">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-ppp-border" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3 bg-ppp-border w-2/3 rounded" />
                    <div className="h-2 bg-ppp-border w-1/2 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : feedEntries.length > 0 ? (
          <div className="flex flex-col gap-3">
            {feedEntries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <FeedItem entry={entry} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3">🏓</div>
            <div className="font-serif font-bold text-2xl text-ppp-text uppercase mb-2">C&apos;est parti !</div>
            <div className="text-ppp-muted text-sm">Enregistre ta première séance</div>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
