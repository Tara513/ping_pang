"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Avatar from "@/components/ui/Avatar"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import { Settings, ChevronRight, Clock } from "lucide-react"
import type { Profile, Session, Match, Equipment, EloRating } from "@/types/database"
import { FEDERATION_META } from "@/lib/elo/calculator"
import { BADGE_DEFINITIONS } from "@/types/app"
import { demoSessions, demoMatches, demoEloRatings } from "@/lib/seeds/demoData"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé",
  competitive: "Compétiteur", elite: "Elite"
}
const SESSION_ICONS: Record<string, string> = {
  technique: "🏓", physique: "💪", match: "⚔️", service: "🎯", competition: "🏆", chill: "😎"
}
const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill"
}

const TABS = ["Activité", "Stats", "ELO", "Matériel", "Badges"]

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<Partial<Session>[]>([])
  const [matches, setMatches] = useState<Partial<Match>[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [elos, setElos] = useState<Partial<EloRating>[]>([])
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [pRes, sRes, mRes, eqRes, eloRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("sessions").select("*").eq("player_id", user.id).order("date", { ascending: false }),
        supabase.from("matches").select("*").eq("player_id", user.id).order("date", { ascending: false }),
        supabase.from("equipment").select("*").eq("player_id", user.id).order("started_at", { ascending: false }),
        supabase.from("elo_ratings").select("*").eq("player_id", user.id),
      ])

      setProfile(pRes.data)
      setSessions(sRes.data?.length ? sRes.data : demoSessions as Session[])
      setMatches(mRes.data?.length ? mRes.data : demoMatches as Match[])
      setEquipment(eqRes.data || [])
      setElos(eloRes.data?.length ? eloRes.data : demoEloRatings as EloRating[])
      setLoading(false)
    }
    load()
  }, [supabase])

  const totalHours = Math.round(sessions.reduce((acc, s) => acc + (s.duration_min || 0), 0) / 60)
  const wins = matches.filter((m) => m.result === "win").length
  const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0

  const earnedBadges = [
    sessions.length >= 10 && BADGE_DEFINITIONS.find((b) => b.type === "centurion"),
    wins >= 5 && BADGE_DEFINITIONS.find((b) => b.type === "precision"),
  ].filter(Boolean)

  return (
    <>
      <TopBar
        title="Profil"
        actions={
          <Link href="/profile/settings" className="text-ppp-muted hover:text-ppp-text transition-colors">
            <Settings size={20} strokeWidth={1.5} />
          </Link>
        }
      />

      <div className="pb-24">
        {/* ── Banner + Avatar ── */}
        <div className="relative">
          {/* Banner */}
          <div className="h-32 bg-ppp-forest" />

          {/* Avatar overlapping */}
          <div className="absolute -bottom-12 left-5">
            <div className="ring-4 ring-ppp-bg rounded-full">
              <Avatar src={profile?.avatar_url} name={profile?.full_name} size="xl" />
            </div>
          </div>

          {/* Edit button top right */}
          <Link
            href="/profile/settings"
            className="absolute top-4 right-4 bg-ppp-white/90 backdrop-blur-sm text-ppp-text text-xs font-serif uppercase tracking-wide px-3 py-1.5 rounded-full border border-gray-200 hover:bg-white transition-all"
          >
            Modifier
          </Link>
        </div>

        {/* ── Identity ── */}
        <div className="px-5 pt-14 pb-5">
          <h1 className="font-serif font-bold text-2xl text-ppp-text uppercase leading-tight">
            {profile?.full_name || "Joueur"}
          </h1>
          <div className="text-ppp-muted text-sm font-serif">@{profile?.username || "username"}</div>

          <div className="flex items-center gap-2 flex-wrap mt-2">
            {profile?.level && (
              <Badge label={LEVEL_LABELS[profile.level] || profile.level} color="forest" />
            )}
            {profile?.city && (
              <span className="text-xs text-ppp-muted font-serif">📍 {profile.city}{profile.club ? ` · ${profile.club}` : ""}</span>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="mx-5 grid grid-cols-3 gap-2 mb-1">
          {[
            { label: "Séances", value: sessions.length },
            { label: "Matchs", value: matches.length },
            { label: "Heures", value: `${totalHours}h` },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
              <div className="font-serif font-bold text-2xl text-ppp-text">{s.value}</div>
              <div className="text-[9px] text-ppp-muted uppercase tracking-[0.12em] font-serif mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-gray-100 mt-4 overflow-x-auto no-scrollbar px-1">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-3.5 text-xs font-semibold font-serif uppercase tracking-[0.08em] flex-shrink-0 border-b-2 transition-all ${
                tab === i
                  ? "border-ppp-forest text-ppp-forest"
                  : "border-transparent text-ppp-muted hover:text-ppp-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="px-5 py-4">
          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl h-20" />
              ))}
            </div>
          ) : (
            <>
              {/* Activité */}
              {tab === 0 && (
                <div className="flex flex-col gap-3">
                  {[
                    ...sessions.slice(0, 5).map((s) => ({ type: "session" as const, data: s })),
                    ...matches.slice(0, 3).map((m) => ({ type: "match" as const, data: m })),
                  ]
                    .sort((a, b) => new Date(b.data.date!).getTime() - new Date(a.data.date!).getTime())
                    .map((item, i) => {
                      const isSession = item.type === "session"
                      const s = item.data as Session
                      const m = item.data as Match
                      const dateStr = item.data.date
                        ? formatDistanceToNow(new Date(item.data.date!), { addSuffix: true, locale: fr })
                        : ""

                      return (
                        <Link key={i} href={isSession ? `/session/${item.data.id}` : `/match/${item.data.id}`}>
                          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                            <div className="text-2xl w-10 h-10 flex items-center justify-center bg-ppp-bg rounded-xl">
                              {isSession ? SESSION_ICONS[s.session_type] || "🏓" : "⚔️"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-serif font-semibold text-sm text-ppp-text">
                                {isSession ? SESSION_LABELS[s.session_type] || s.session_type : `vs ${m.opponent_name}`}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-ppp-muted font-serif">{dateStr}</span>
                                {isSession && s.duration_min && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-ppp-muted font-serif">
                                    <Clock size={9} /> {Math.round(s.duration_min / 60 * 10) / 10}h
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isSession && m.result && (
                              <span className={`text-[10px] font-serif font-bold uppercase px-2 py-1 rounded-full ${m.result === "win" ? "bg-ppp-forest/10 text-ppp-forest" : "bg-red/10 text-red"}`}>
                                {m.result === "win" ? "W" : "L"}
                              </span>
                            )}
                            <ChevronRight size={14} className="text-ppp-muted/40 shrink-0" />
                          </div>
                        </Link>
                      )
                    })}
                </div>
              )}

              {/* Stats */}
              {tab === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Séances", value: sessions.length, icon: "🏓" },
                    { label: "Matchs", value: matches.length, icon: "⚔️" },
                    { label: "Heures", value: `${totalHours}h`, icon: "⏱" },
                    { label: "Win rate", value: `${winRate}%`, icon: "🏆", color: winRate >= 50 ? "#2D4A3E" : "#C8352A" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <div className="font-serif font-bold text-4xl leading-none" style={s.color ? { color: s.color } : { color: "#1A1A1A" }}>
                        {s.value}
                      </div>
                      <div className="text-[10px] text-ppp-muted uppercase tracking-[0.12em] font-serif mt-2">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ELO */}
              {tab === 2 && (
                <div className="flex flex-col gap-3">
                  {elos.length === 0 ? (
                    <div className="text-center py-12 text-ppp-muted font-serif">
                      <div className="text-4xl mb-2">📊</div>Aucun ELO enregistré
                    </div>
                  ) : elos.map((r) => {
                    const meta = FEDERATION_META[r.federation as keyof typeof FEDERATION_META]
                    return (
                      <div key={r.federation} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{meta?.flag}</span>
                          <div>
                            <div className="font-semibold text-sm font-serif text-ppp-text">{meta?.name}</div>
                            <div className="text-xs text-ppp-muted font-serif">{meta?.country}</div>
                          </div>
                        </div>
                        <div className="font-serif font-bold text-3xl text-ppp-forest">{r.elo}</div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Matériel */}
              {tab === 3 && (
                <div className="flex flex-col gap-3">
                  {equipment.length === 0 ? (
                    <div className="text-center py-12 text-ppp-muted font-serif">
                      <div className="text-4xl mb-2">🏓</div>Aucun matériel renseigné
                    </div>
                  ) : equipment.map((eq) => (
                    <div key={eq.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      {eq.is_current && <Badge label="Actuel" color="forest" className="mb-3" />}
                      <div className="flex flex-col gap-3">
                        {[
                          { key: "Bois", val: eq.blade },
                          { key: "Coup droit", val: eq.rubber_fh ? `${eq.rubber_fh}${eq.thickness_fh ? ` (${eq.thickness_fh}mm)` : ""}` : null },
                          { key: "Revers", val: eq.rubber_bh ? `${eq.rubber_bh}${eq.thickness_bh ? ` (${eq.thickness_bh}mm)` : ""}` : null },
                        ].filter(r => r.val).map(r => (
                          <div key={r.key}>
                            <div className="text-[9px] text-ppp-muted uppercase tracking-[0.12em] font-serif">{r.key}</div>
                            <div className="text-sm text-ppp-text font-serif mt-0.5">{r.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Badges */}
              {tab === 4 && (
                <div className="grid grid-cols-3 gap-3">
                  {BADGE_DEFINITIONS.map((b) => {
                    const earned = earnedBadges.some((e) => e && e.type === b.type)
                    return (
                      <div
                        key={b.type}
                        className={`bg-white border rounded-2xl p-4 text-center shadow-sm transition-all ${
                          earned ? "border-ppp-forest/30 bg-ppp-forest/5" : "border-gray-100 opacity-40"
                        }`}
                      >
                        <div className="text-3xl mb-2">{b.emoji}</div>
                        <div className="text-[9px] text-ppp-text font-semibold font-serif uppercase tracking-wider leading-tight">{b.label}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
