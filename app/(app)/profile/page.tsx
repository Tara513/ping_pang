"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Avatar from "@/components/ui/Avatar"
import { Settings } from "lucide-react"
import type { Profile, Session, Match, Equipment, EloRating } from "@/types/database"
import { FEDERATION_META } from "@/lib/elo/calculator"
import { BADGE_DEFINITIONS } from "@/types/app"
import { demoSessions, demoMatches, demoEloRatings } from "@/lib/seeds/demoData"
import { allowDemoData } from "@/lib/demo"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé",
  competitive: "Compétiteur", elite: "Elite",
}
const PLAY_STYLE_LABELS: Record<string, string> = {
  attacker: "Attaquant", defender: "Défenseur", allround: "Polyvalent",
  penhold: "Penholder", other: "Autre",
}
const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill",
}
const TABS = ["Activité", "Stats", "ELO", "Matériel", "Badges"]

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<Partial<Session>[]>([])
  const [matches, setMatches] = useState<Partial<Match>[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [elos, setElos] = useState<Partial<EloRating>[]>([])
  const [earnedBadgeTypes, setEarnedBadgeTypes] = useState<string[]>([])
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [pRes, sRes, mRes, eqRes, eloRes, badgeRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("sessions").select("*").eq("player_id", user.id).order("date", { ascending: false }),
        supabase.from("matches").select("*").eq("player_id", user.id).order("date", { ascending: false }),
        supabase.from("equipment").select("*").eq("player_id", user.id).order("started_at", { ascending: false }),
        supabase.from("elo_ratings").select("*").eq("player_id", user.id),
        supabase.from("badges").select("badge_type").eq("player_id", user.id),
      ])
      setProfile(pRes.data)
      setSessions(sRes.data?.length ? sRes.data : allowDemoData ? demoSessions as Session[] : [])
      setMatches(mRes.data?.length ? mRes.data : allowDemoData ? demoMatches as Match[] : [])
      setEquipment(eqRes.data || [])
      setElos(eloRes.data?.length ? eloRes.data : allowDemoData ? demoEloRatings as EloRating[] : [])
      setEarnedBadgeTypes((badgeRes.data || []).map((badge) => badge.badge_type))
      setLoading(false)
    }
    load()
  }, [supabase])

  const totalHours = Math.round(sessions.reduce((a, s) => a + (s.duration_min || 0), 0) / 60)
  const wins = matches.filter((m) => m.result === "win").length
  const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0
  return (
    <>
      <TopBar
        title="Profil"
        actions={
          <Link href="/profile/settings" className="text-sage hover:text-white transition-colors">
            <Settings size={18} strokeWidth={1.5} />
          </Link>
        }
      />
      <PageWrapper noPadding>
        {/* Hero header — full bleed green */}
        <div className="bg-green px-4 pt-8 pb-6">
          <div className="flex items-end gap-4">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size="xl" />
            <div className="flex-1 pb-1">
              <div className="font-display font-light text-white leading-none" style={{ fontSize: 32 }}>
                {profile?.full_name || "Joueur"}
              </div>
              <div className="text-[10px] text-sage uppercase tracking-[0.2em] mt-1">
                @{profile?.username || "username"}
              </div>
              {profile?.level && (
                <div className="mt-2">
                  <span className="text-[9px] text-green-light uppercase tracking-[0.2em] border border-green-light/40 px-2 py-0.5">
                    {LEVEL_LABELS[profile.level] || profile.level}
                  </span>
                  {profile.play_style && (
                    <span className="text-[9px] text-sage ml-2">· {PLAY_STYLE_LABELS[profile.play_style]}</span>
                  )}
                </div>
              )}
              {profile?.city && (
                <div className="text-[10px] text-sage mt-1">
                  {profile.city}{profile.club ? ` · ${profile.club}` : ""}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex border-b border-white/[0.06]">
          {[
            { label: "Séances", value: sessions.length },
            { label: "Matchs", value: matches.length },
            { label: "Heures", value: `${totalHours}h` },
            { label: "Win %", value: `${winRate}%` },
          ].map((s, i) => (
            <div
              key={i}
              className={`flex-1 py-4 text-center ${i < 3 ? "border-r border-white/[0.06]" : ""}`}
            >
              <div className="font-display text-2xl font-light text-white">{s.value}</div>
              <div className="text-[9px] text-sage uppercase tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-white/[0.06]">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-5 py-3 text-[9px] uppercase tracking-[0.2em] flex-shrink-0 border-b-2 -mb-px transition-all ${
                tab === i ? "border-white text-white" : "border-transparent text-sage/50 hover:text-sage"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-surface" />)}
            </div>
          ) : (
            <>
              {/* Activité — line based */}
              {tab === 0 && (
                <div>
                  {[...sessions.slice(0, 5).map((s) => ({ type: "session" as const, data: s })),
                    ...matches.slice(0, 3).map((m) => ({ type: "match" as const, data: m }))]
                    .sort((a, b) => new Date(b.data.date!).getTime() - new Date(a.data.date!).getTime())
                    .map((item, i) => (
                      <Link
                        key={i}
                        href={item.type === "session" ? `/session/${item.data.id}` : `/match/${item.data.id}`}
                        className="flex gap-3 py-4 border-b border-white/[0.05] active:bg-white/[0.02] transition-colors"
                      >
                        <div className={`w-[3px] flex-shrink-0 self-stretch ${item.type === "session" ? "bg-green-light" : "bg-red"}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-[9px] text-sage uppercase tracking-[0.15em]">
                              {item.type === "session"
                                ? SESSION_LABELS[(item.data as Session).session_type] || "Séance"
                                : `Match vs ${(item.data as Match).opponent_name}`}
                            </div>
                            <div className="text-[9px] text-sage/40">
                              {formatDistanceToNow(new Date(item.data.date!), { locale: fr, addSuffix: true })}
                            </div>
                          </div>
                          <div className="font-display text-lg font-light text-white mt-0.5">
                            {item.type === "session"
                              ? `${Math.round(((item.data as Session).duration_min || 0) / 60 * 10) / 10}h · ${(item.data as Session).location || "Sans lieu"}`
                              : `${(item.data as Match).sets_won ?? "?"} — ${(item.data as Match).sets_lost ?? "?"}`}
                          </div>
                        </div>
                        {item.type === "match" && (item.data as Match).result && (
                          <div className={`self-center text-[9px] uppercase tracking-widest px-2 py-0.5 border ${
                            (item.data as Match).result === "win"
                              ? "border-green-light text-green-light"
                              : "border-red text-red"
                          }`}>
                            {(item.data as Match).result === "win" ? "W" : "L"}
                          </div>
                        )}
                      </Link>
                    ))}
                </div>
              )}

              {/* Stats */}
              {tab === 1 && (
                <div className="flex flex-col">
                  {[
                    { label: "Séances totales", value: sessions.length },
                    { label: "Matchs disputés", value: matches.length },
                    { label: "Heures de jeu", value: `${totalHours}h` },
                    { label: "Taux de victoire", value: `${winRate}%` },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-white/[0.05]">
                      <div className="text-[9px] text-sage uppercase tracking-[0.2em]">{s.label}</div>
                      <div className="font-display text-3xl font-light text-white">{s.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ELO */}
              {tab === 2 && (
                <div>
                  {elos.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="font-display text-6xl font-light text-white/10">ELO</div>
                      <div className="text-[10px] text-sage uppercase tracking-[0.2em] mt-3">Aucun ELO enregistré</div>
                    </div>
                  ) : elos.map((r) => {
                    const meta = FEDERATION_META[r.federation as keyof typeof FEDERATION_META]
                    return (
                      <div key={r.federation} className="flex items-center justify-between py-4 border-b border-white/[0.05]">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{meta?.flag}</span>
                          <div>
                            <div className="text-sm text-white font-sans">{meta?.name}</div>
                            <div className="text-[10px] text-sage">{meta?.country}</div>
                          </div>
                        </div>
                        <div className="font-display text-4xl font-light text-white">{r.elo}</div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Matériel */}
              {tab === 3 && (
                <div>
                  {equipment.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="font-display text-5xl font-light text-white/10">🏓</div>
                      <div className="text-[10px] text-sage uppercase tracking-[0.2em] mt-3">Aucun matériel renseigné</div>
                    </div>
                  ) : equipment.map((eq) => (
                    <div key={eq.id} className="py-4 border-b border-white/[0.05]">
                      {eq.is_current && (
                        <div className="text-[9px] text-green-light uppercase tracking-[0.2em] mb-3">· Actuel</div>
                      )}
                      {[
                        { label: "Bois", value: eq.blade },
                        { label: "Coup droit", value: eq.rubber_fh ? `${eq.rubber_fh}${eq.thickness_fh ? ` (${eq.thickness_fh}mm)` : ""}` : null },
                        { label: "Revers", value: eq.rubber_bh ? `${eq.rubber_bh}${eq.thickness_bh ? ` (${eq.thickness_bh}mm)` : ""}` : null },
                      ].filter((x) => x.value).map((x) => (
                        <div key={x.label} className="flex items-baseline justify-between py-1.5">
                          <div className="text-[9px] text-sage uppercase tracking-[0.2em]">{x.label}</div>
                          <div className="text-sm text-white font-sans">{x.value}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Badges */}
              {tab === 4 && (
                <div className="flex flex-col gap-0">
                  {BADGE_DEFINITIONS.map((b) => {
                    const earned = earnedBadgeTypes.includes(b.type)
                    return (
                      <div
                        key={b.type}
                        className={`flex items-center gap-4 py-4 border-b border-white/[0.05] transition-opacity ${earned ? "" : "opacity-30"}`}
                      >
                        <div className="text-3xl w-10 text-center">{b.emoji}</div>
                        <div className="flex-1">
                          <div className="text-sm text-white font-sans font-medium">{b.label}</div>
                          <div className="text-[10px] text-sage mt-0.5">{b.description}</div>
                        </div>
                        {earned && (
                          <div className="text-[9px] text-green-light uppercase tracking-widest">✓</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </>
  )
}
