"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import BottomNav from "@/components/layout/BottomNav"
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

const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill",
}

const MATCH_LABELS: Record<string, string> = {
  friendly: "Amical", league: "Championnat", tournament: "Tournoi", training: "Entraînement",
}

function WeekHero({ sessions, targetHours }: { sessions: Partial<Session>[]; targetHours: number }) {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)

  const thisWeek = sessions.filter((s) => s.date && new Date(s.date) >= weekStart)
  const totalMins = thisWeek.reduce((acc, s) => acc + (s.duration_min || 0), 0)
  const totalHours = Math.round((totalMins / 60) * 10) / 10
  const progress = Math.min((totalHours / targetHours) * 100, 100)

  const sessionTypes = ["technique", "physique", "match", "service", "competition", "chill"]
  const typeDone = new Set(thisWeek.map((s) => s.session_type))

  return (
    <div className="-mx-4 bg-green px-4 py-7">
      <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-3">Cette semaine</div>

      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-light text-white leading-none" style={{ fontSize: "80px" }}>
            {totalHours}
          </span>
          <span className="text-green-light font-display text-3xl font-light mb-2">h</span>
        </div>
        <div className="flex flex-col items-end mb-2">
          <span className="font-display font-light text-white leading-none text-5xl">{thisWeek.length}</span>
          <span className="text-[9px] text-sage uppercase tracking-[0.25em] mt-1">séances</span>
        </div>
      </div>

      <div className="mt-4 mb-5">
        <div className="h-px bg-white/20 w-full relative">
          <div
            className="absolute top-0 left-0 h-full bg-white/60 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[9px] text-sage/60 mt-1.5">
          {totalHours}h / {targetHours}h objectif
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {sessionTypes.map((t) => {
          const done = typeDone.has(t as Session["session_type"])
          return (
            <span
              key={t}
              className={`text-[9px] uppercase tracking-[0.1em] px-2 py-1 transition-all font-sans ${
                done ? "bg-white/10 text-white" : "text-sage/40"
              }`}
            >
              {done ? "✓ " : ""}{SESSION_LABELS[t]}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function FeedItem({ entry }: { entry: FeedEntry }) {
  const isSession = entry.type === "session"
  const s = entry.data as Session
  const m = entry.data as Match

  const typeLabel = isSession
    ? SESSION_LABELS[s.session_type] || s.session_type
    : MATCH_LABELS[m.match_type] || m.match_type

  const accentColor = isSession
    ? SESSION_TYPE_COLORS[s.session_type] || "#4A5240"
    : m.result === "win" ? "#1A5C4A" : "#C72927"

  const dateStr = formatDistanceToNow(new Date(entry.data.date), { addSuffix: true, locale: fr })

  const title = isSession
    ? SESSION_LABELS[s.session_type] || "Séance"
    : `vs ${m.opponent_name || "Adversaire"}`

  const sub = isSession
    ? [
        s.duration_min ? `${Math.round(s.duration_min / 60 * 10) / 10}h` : null,
        s.location ? s.location : null,
      ].filter(Boolean).join(" · ")
    : m.sets_won !== null ? `${m.sets_won}–${m.sets_lost}` : undefined

  return (
    <Link href={isSession ? `/session/${entry.data.id}` : `/match/${entry.data.id}`}>
      <div className="flex gap-4 py-4 border-b border-white/[0.05] active:bg-white/[0.02] transition-colors">
        <div className="w-[3px] flex-shrink-0 self-stretch" style={{ backgroundColor: accentColor }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-sans uppercase tracking-[0.15em] text-sage">{typeLabel}</span>
            {!isSession && m.result && (
              <Badge
                label={m.result === "win" ? "Victoire" : "Défaite"}
                color={m.result === "win" ? "green" : "red"}
              />
            )}
            <span className="text-[10px] text-sage/50 ml-auto flex-shrink-0">{dateStr}</span>
          </div>
          <div className="font-display text-xl font-light text-white leading-tight">{title}</div>
          {sub && <div className="text-xs text-sage mt-1">{sub}</div>}
        </div>
        <Avatar
          src={entry.profile.avatar_url}
          name={entry.profile.full_name}
          size="sm"
          className="flex-shrink-0 self-center"
        />
      </div>
    </Link>
  )
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4 border-b border-white/[0.05] animate-pulse">
          <div className="w-[3px] bg-white/10 self-stretch flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-2.5 bg-white/10 w-1/3" />
            <div className="h-4 bg-white/10 w-2/3" />
            <div className="h-2 bg-white/10 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="font-display font-light text-white/10 leading-none select-none" style={{ fontSize: "120px" }}>
        0
      </div>
      <div className="font-display text-2xl font-light text-white mt-4">C&apos;est parti !</div>
      <div className="text-xs text-sage mt-2 tracking-[0.05em]">Enregistre ta première séance</div>
    </div>
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
  const todayStr = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  }).toUpperCase()

  return (
    <main className="min-h-screen bg-black pb-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-14 pb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-1">{todayStr}</div>
            <div className="font-display font-light text-white leading-none" style={{ fontSize: "52px" }}>
              {firstName}
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Link href="/profile" className="text-sage hover:text-white transition-colors">
              <Bell size={20} strokeWidth={1.5} />
            </Link>
            <Link href="/profile">
              <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
            </Link>
          </div>
        </div>
      </motion.div>

      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <WeekHero sessions={sessions} targetHours={targetHours} />
        </motion.div>
      )}

      <div className="h-px bg-white/[0.06] mt-8 mb-6" />

      <div>
        <div className="flex items-baseline justify-between mb-5">
          <div className="text-[9px] text-sage uppercase tracking-[0.3em]">Activité récente</div>
          <Link href="/stats" className="text-[9px] text-sage hover:text-white transition-colors uppercase tracking-[0.2em]">
            Tout voir →
          </Link>
        </div>

        {loading ? (
          <FeedSkeleton />
        ) : feedEntries.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            {feedEntries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
              >
                <FeedItem entry={entry} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyFeed />
        )}
      </div>

      <BottomNav />
    </main>
  )
}
