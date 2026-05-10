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
import { Settings } from "lucide-react"
import type { Profile, Session, Match, Equipment, EloRating } from "@/types/database"
import { FEDERATION_META } from "@/lib/elo/calculator"
import { BADGE_DEFINITIONS } from "@/types/app"
import { demoSessions, demoMatches, demoEloRatings } from "@/lib/seeds/demoData"

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé",
  competitive: "Compétiteur", elite: "Elite"
}

const PLAY_STYLE_LABELS: Record<string, string> = {
  attacker: "Attaquant", defender: "Défenseur", allround: "Polyvalent",
  penhold: "Penholder", other: "Autre"
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
      if (!user) return

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
          <Link href="/profile/settings" className="text-sage hover:text-white transition-colors">
            <Settings size={20} />
          </Link>
        }
      />
      <PageWrapper noPadding>
        {/* Profile header */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size="xl" />
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-3xl font-light text-white leading-none">
                {profile?.full_name || "Joueur"}
              </h1>
              <div className="text-sage text-sm mt-1">@{profile?.username || "username"}</div>
              {profile?.level && (
                <Badge label={LEVEL_LABELS[profile.level] || profile.level} color="green" className="mt-2" />
              )}
              {profile?.play_style && (
                <span className="ml-2 text-xs text-sage">{PLAY_STYLE_LABELS[profile.play_style]}</span>
              )}
              {profile?.city && (
                <div className="text-xs text-sage mt-1">📍 {profile.city}{profile.club ? ` · ${profile.club}` : ""}</div>
              )}
            </div>
          </div>

          {/* Stats rapides */}
          <div className="flex gap-0 mt-6 border border-white/[0.08]">
            {[
              { label: "Séances", value: sessions.length },
              { label: "Matchs", value: matches.length },
              { label: "Heures", value: `${totalHours}h` },
            ].map((s, i) => (
              <div key={i} className={`flex-1 py-3 text-center ${i < 2 ? "border-r border-white/[0.08]" : ""}`}>
                <div className="font-display text-2xl text-white">{s.value}</div>
                <div className="text-[10px] text-sage uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide flex-shrink-0 border-b-2 transition-all ${
                tab === i ? "border-white text-white" : "border-transparent text-sage hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface border border-white/[0.08] h-20" />
              ))}
            </div>
          ) : (
            <>
              {tab === 0 && (
                <div className="flex flex-col gap-3">
                  {[...sessions.slice(0, 5).map((s) => ({ type: "session" as const, data: s })),
                    ...matches.slice(0, 3).map((m) => ({ type: "match" as const, data: m }))
                  ].sort((a, b) => new Date(b.data.date!).getTime() - new Date(a.data.date!).getTime())
                    .map((item, i) => (
                      <Link
                        key={i}
                        href={item.type === "session" ? `/session/${item.data.id}` : `/match/${item.data.id}`}
                      >
                        <Card className="flex items-center gap-3 hover:border-white/20 transition-all">
                          <div className="text-2xl">
                            {item.type === "session" ? "🏓" : "⚔️"}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-white font-semibold">
                              {item.type === "session"
                                ? `Séance ${(item.data as Session).session_type}`
                                : `vs ${(item.data as Match).opponent_name}`}
                            </div>
                            <div className="text-xs text-sage">{item.data.date}</div>
                          </div>
                          {item.type === "match" && (item.data as Match).result && (
                            <Badge
                              label={(item.data as Match).result === "win" ? "W" : "L"}
                              color={(item.data as Match).result === "win" ? "green" : "red"}
                            />
                          )}
                        </Card>
                      </Link>
                    ))}
                </div>
              )}

              {tab === 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Séances", value: sessions.length },
                    { label: "Matchs", value: matches.length },
                    { label: "Heures", value: `${totalHours}h` },
                    { label: "Win rate", value: `${winRate}%` },
                  ].map((s) => (
                    <div key={s.label} className="bg-surface border border-white/[0.08] p-4">
                      <div className="text-[10px] text-sage uppercase tracking-wider">{s.label}</div>
                      <div className="font-display text-3xl text-white mt-1">{s.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 2 && (
                <div className="flex flex-col gap-3">
                  {elos.length === 0 ? (
                    <div className="text-center py-12 text-sage">
                      <div className="text-4xl mb-2">📊</div>
                      Aucun ELO enregistré
                    </div>
                  ) : (
                    elos.map((r) => {
                      const meta = FEDERATION_META[r.federation as keyof typeof FEDERATION_META]
                      return (
                        <Card key={r.federation} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{meta?.flag}</span>
                            <div>
                              <div className="font-semibold text-sm text-white">{meta?.name}</div>
                              <div className="text-xs text-sage">{meta?.country}</div>
                            </div>
                          </div>
                          <div className="font-display text-3xl text-white">{r.elo}</div>
                        </Card>
                      )
                    })
                  )}
                </div>
              )}

              {tab === 3 && (
                <div className="flex flex-col gap-3">
                  {equipment.length === 0 ? (
                    <div className="text-center py-12 text-sage">
                      <div className="text-4xl mb-2">🏓</div>
                      Aucun matériel renseigné
                    </div>
                  ) : (
                    equipment.map((eq) => (
                      <Card key={eq.id}>
                        {eq.is_current && <Badge label="Actuel" color="green" className="mb-3" />}
                        <div className="flex flex-col gap-2">
                          {eq.blade && (
                            <div>
                              <div className="text-[10px] text-sage uppercase tracking-wider">Bois</div>
                              <div className="text-sm text-white">{eq.blade}</div>
                            </div>
                          )}
                          {eq.rubber_fh && (
                            <div>
                              <div className="text-[10px] text-sage uppercase tracking-wider">Coup droit</div>
                              <div className="text-sm text-white">{eq.rubber_fh} {eq.thickness_fh ? `(${eq.thickness_fh}mm)` : ""}</div>
                            </div>
                          )}
                          {eq.rubber_bh && (
                            <div>
                              <div className="text-[10px] text-sage uppercase tracking-wider">Revers</div>
                              <div className="text-sm text-white">{eq.rubber_bh} {eq.thickness_bh ? `(${eq.thickness_bh}mm)` : ""}</div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {tab === 4 && (
                <div className="grid grid-cols-3 gap-3">
                  {BADGE_DEFINITIONS.map((b) => {
                    const earned = earnedBadges.some((e) => e && e.type === b.type)
                    return (
                      <div
                        key={b.type}
                        className={`border p-3 text-center transition-all ${
                          earned ? "border-green bg-green/10" : "border-white/10 opacity-40"
                        }`}
                      >
                        <div className="text-3xl mb-1">{b.emoji}</div>
                        <div className="text-[10px] text-white font-semibold uppercase tracking-wider">{b.label}</div>
                        <div className="text-[10px] text-sage mt-0.5">{b.description}</div>
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
