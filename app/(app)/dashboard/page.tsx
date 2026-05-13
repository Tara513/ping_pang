"use client"

import ActivityCard from "@/components/training/ActivityCard"
import MetricCard from "@/components/training/MetricCard"
import PageWrapper from "@/components/layout/PageWrapper"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { createClient } from "@/lib/supabase/client"
import { demoMatches, demoSessions } from "@/lib/seeds/demoData"
import type { Match, Profile, Session } from "@/types/database"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Activity, ArrowUpRight, CalendarDays, Clock3, Flame, Plus, Swords, Target, Trophy } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

interface FeedEntry {
  key: string
  type: "session" | "match"
  data: Partial<Session> | Partial<Match>
  href: string
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), [])
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const [sessions, setSessions] = useState<Partial<Session>[]>([])
  const [matches, setMatches] = useState<Partial<Match>[]>([])
  const [targetHours, setTargetHours] = useState(5)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setSessions(demoSessions)
          setMatches(demoMatches)
          setLoading(false)
          return
        }

        const [profileRes, sessionsRes, matchesRes, goalRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("sessions").select("*").eq("player_id", user.id).order("date", { ascending: false }).limit(20),
          supabase.from("matches").select("*").eq("player_id", user.id).order("date", { ascending: false }).limit(12),
          supabase.from("weekly_goals").select("*").eq("player_id", user.id).order("week_start", { ascending: false }).limit(1),
        ])

        setProfile(profileRes.data || null)
        setSessions(sessionsRes.data?.length ? sessionsRes.data : demoSessions)
        setMatches(matchesRes.data?.length ? matchesRes.data : demoMatches)
        if (goalRes.data?.[0]?.target_hours) setTargetHours(goalRes.data[0].target_hours)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [supabase])

  const weekStart = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay() + 1)
    start.setHours(0, 0, 0, 0)
    return start
  }, [])

  const weekSessions = sessions.filter((session) => session.date && new Date(session.date) >= weekStart)
  const weekHours = Math.round((weekSessions.reduce((sum, session) => sum + (session.duration_min || 0), 0) / 60) * 10) / 10
  const progress = Math.min(100, Math.round((weekHours / targetHours) * 100))
  const wins = matches.filter((match) => match.result === "win").length
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0
  const firstName = profile?.full_name?.split(" ")[0] || profile?.username || "Joueur"

  const feedEntries: FeedEntry[] = [
    ...sessions.slice(0, 7).map((session, index) => ({
      key: `s-${session.id || index}`,
      type: "session" as const,
      data: session,
      href: `/session/${session.id || `demo-session-${index}`}`,
    })),
    ...matches.slice(0, 5).map((match, index) => ({
      key: `m-${match.id || index}`,
      type: "match" as const,
      data: match,
      href: `/match/${match.id || `demo-match-${index}`}`,
    })),
  ]
    .sort((a, b) => new Date(b.data.date || "").getTime() - new Date(a.data.date || "").getTime())
    .slice(0, 8)

  return (
    <PageWrapper size="wide">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div className="space-y-5">
          <Card tone="elevated" padding="lg" className="relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 hidden w-1/2 field-surface opacity-40 md:block" />
            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <Badge label={format(new Date(), "eeee d MMMM", { locale: fr })} color="gold" />
                <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-ppp-text sm:text-5xl">
                  Salut {firstName}, garde le tempo.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-ppp-muted">
                  Ton cockpit regroupe la semaine, les séances, les matchs et les signaux de progression.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button size="lg">
                    <Link href="/session/new" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Logger une séance
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline">
                    <Link href="/match/new" className="flex items-center gap-2">
                      <Swords className="h-4 w-4" />
                      Nouveau match
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/24 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ppp-muted">Semaine</p>
                    <div className="mt-2 text-5xl font-black text-ppp-text">
                      {weekHours}
                      <span className="text-xl text-ppp-muted">h</span>
                    </div>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-ppp-forest text-black">
                    <Target className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-ppp-forest" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-ppp-muted">
                  <span>{progress}% de l'objectif</span>
                  <span>{targetHours}h visées</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Séances" value={sessions.length} detail={`${weekSessions.length} cette semaine`} icon={CalendarDays} tone="green" />
            <MetricCard label="Heures totales" value={`${Math.round(sessions.reduce((sum, s) => sum + (s.duration_min || 0), 0) / 60)}h`} detail="cumul enregistré" icon={Clock3} />
            <MetricCard label="Win rate" value={`${winRate}%`} detail={`${wins}/${matches.length} victoires`} icon={Trophy} tone={winRate >= 50 ? "gold" : "red"} />
            <MetricCard label="Rythme" value={`${weekSessions.length}x`} detail="sessions récentes" icon={Flame} tone="gold" />
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-ppp-text">Activité récente</h2>
                <p className="text-sm text-ppp-muted">Séances et matchs triés par fraîcheur.</p>
              </div>
              <Button variant="ghost" size="sm">
                <Link href="/stats" className="flex items-center gap-1">
                  Analyse
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="h-24 animate-pulse bg-white/5" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {feedEntries.map((entry) => (
                  <ActivityCard key={entry.key} type={entry.type} item={entry.data} href={entry.href} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <Card tone="accent" padding="lg">
            <div className="flex items-center gap-3">
              <Avatar src={profile?.avatar_url} name={profile?.full_name || profile?.username} size="lg" />
              <div>
                <h2 className="text-lg font-black text-ppp-text">{profile?.full_name || "Profil joueur"}</h2>
                <p className="text-sm text-ppp-muted">@{profile?.username || "pingpang"}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-black/20 p-3">
                <div className="font-black text-ppp-text">{sessions.length}</div>
                <div className="text-[0.65rem] uppercase text-ppp-muted">séances</div>
              </div>
              <div className="rounded-lg bg-black/20 p-3">
                <div className="font-black text-ppp-text">{matches.length}</div>
                <div className="text-[0.65rem] uppercase text-ppp-muted">matchs</div>
              </div>
              <div className="rounded-lg bg-black/20 p-3">
                <div className="font-black text-ppp-text">{winRate}%</div>
                <div className="text-[0.65rem] uppercase text-ppp-muted">win</div>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-ppp-text">Plan du jour</h2>
              <Activity className="h-4 w-4 text-ppp-forest" />
            </div>
            <div className="space-y-3">
              {["15 min services courts", "20 min revers sur rythme", "3 sets situationnels"].map((task, index) => (
                <div key={task} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/4 p-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ppp-forest/12 text-xs font-bold text-ppp-forest">
                    {index + 1}
                  </span>
                  <span className="text-sm text-ppp-text">{task}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card tone="light" padding="lg">
            <Badge label="Insight" color="dark" />
            <p className="mt-4 text-2xl font-black leading-tight text-black">
              Les séances courtes mais décrites créent les meilleures courbes de progression.
            </p>
          </Card>
        </aside>
      </section>
    </PageWrapper>
  )
}
