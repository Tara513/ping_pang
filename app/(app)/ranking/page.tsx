"use client"

import { useState, useMemo } from "react"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Card from "@/components/ui/Card"
import { demoPros } from "@/lib/seeds/proPlayers"
import { Search, TrendingUp } from "lucide-react"

const PLAY_STYLE_LABELS: Record<string, string> = {
  attacker: "Attaquant", defender: "Défenseur", allround: "Polyvalent", penhold: "Penholder",
}

const PRO_ROUTINES: Record<string, { day: string; focus: string; duration: string }[]> = {
  p1: [
    { day: "Lun", focus: "Technique intensive — topspins et régularité", duration: "3h" },
    { day: "Mar", focus: "Physique — endurance et footwork", duration: "2h" },
    { day: "Mer", focus: "Service et retour de service", duration: "2h30" },
    { day: "Jeu", focus: "Sparring contre partenaires d'entraînement", duration: "3h" },
    { day: "Ven", focus: "Tactique — analyse vidéo + exercices ciblés", duration: "2h" },
    { day: "Sam", focus: "Compétition ou simulation", duration: "4h" },
    { day: "Dim", focus: "Récupération active", duration: "1h" },
  ],
  p2: [
    { day: "Lun", focus: "Multiball — précision et vitesse", duration: "2h30" },
    { day: "Mar", focus: "Physique — explosivité et agilité", duration: "2h" },
    { day: "Mer", focus: "Matchs d'entraînement", duration: "3h" },
    { day: "Jeu", focus: "Service + 3e balle", duration: "2h" },
    { day: "Ven", focus: "Technique — points faibles", duration: "2h30" },
    { day: "Sam", focus: "Tournoi ou compétition", duration: "Full day" },
    { day: "Dim", focus: "Repos", duration: "—" },
  ],
  p7: [
    { day: "Lun", focus: "Technique — coup droit et revers", duration: "2h" },
    { day: "Mar", focus: "Physique avec préparateur", duration: "1h30" },
    { day: "Mer", focus: "Séance scolaire + entraînement court", duration: "1h" },
    { day: "Jeu", focus: "Service et tactique", duration: "2h" },
    { day: "Ven", focus: "Matchs d'entraînement", duration: "2h30" },
    { day: "Sam", focus: "Compétition en club", duration: "3h" },
    { day: "Dim", focus: "Récupération", duration: "—" },
  ],
  p9: [
    { day: "Lun", focus: "Technique — régularité et placement", duration: "2h" },
    { day: "Mar", focus: "Physique léger — yoga et stretching", duration: "1h" },
    { day: "Mer", focus: "Service et retour", duration: "1h30" },
    { day: "Jeu", focus: "Sparring avec jeunes joueurs", duration: "2h" },
    { day: "Ven", focus: "Technique — coup droit longue ligne", duration: "2h" },
    { day: "Sam", focus: "Match ou compétition", duration: "3h" },
    { day: "Dim", focus: "Repos complet", duration: "—" },
  ],
}

const DEFAULT_ROUTINE = [
  { day: "Lun", focus: "Technique — entraînement spécifique", duration: "2h30" },
  { day: "Mar", focus: "Physique et condition physique", duration: "1h30" },
  { day: "Mer", focus: "Service et tactique", duration: "2h" },
  { day: "Jeu", focus: "Sparring et matchs d'entraînement", duration: "2h30" },
  { day: "Ven", focus: "Technique — points faibles", duration: "2h" },
  { day: "Sam", focus: "Compétition officielle", duration: "Full day" },
  { day: "Dim", focus: "Récupération", duration: "1h" },
]

type Tab = "profil" | "routine"

export default function RankingPage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<(typeof demoPros)[0] | null>(null)
  const [tab, setTab] = useState<Tab>("profil")

  const filtered = useMemo(() =>
    demoPros.filter((p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.country?.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  )

  if (selected) {
    const equipment = selected.equipment as Record<string, string> | null
    const routine = PRO_ROUTINES[selected.id || ""] || DEFAULT_ROUTINE

    return (
      <>
        <TopBar title={selected.full_name || "Joueur"} showBack onBack={() => { setSelected(null); setTab("profil") }} />
        <PageWrapper>
          <div className="flex flex-col gap-4 pt-4">
            {/* Header */}
            <div className="bg-green/10 border border-green/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-2xl mb-1">{selected.country?.split(" ")[0]}</div>
                  <h1 className="font-display text-4xl font-light text-white leading-none">{selected.full_name}</h1>
                  <div className="text-sage text-sm mt-1">{selected.country?.split(" ").slice(1).join(" ")} · {selected.club}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-sage uppercase tracking-wider">Rang ITTF</div>
                  <div className="font-display text-6xl text-white">#{selected.ittf_ranking}</div>
                </div>
              </div>
              <div className="flex gap-6">
                <div>
                  <div className="text-[10px] text-sage uppercase tracking-wider">Points</div>
                  <div className="font-display text-2xl text-white">{selected.ittf_points?.toLocaleString()}</div>
                </div>
                {selected.birth_year && (
                  <div>
                    <div className="text-[10px] text-sage uppercase tracking-wider">Né en</div>
                    <div className="font-display text-2xl text-white">{selected.birth_year}</div>
                  </div>
                )}
                {selected.play_style && (
                  <div>
                    <div className="text-[10px] text-sage uppercase tracking-wider">Style</div>
                    <div className="text-sm text-white">{PLAY_STYLE_LABELS[selected.play_style] || selected.play_style}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {(["profil", "routine"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                    tab === t ? "text-white border-green" : "text-sage border-transparent hover:text-white"
                  }`}
                >
                  {t === "profil" ? "Profil" : "Routine d'entraînement"}
                </button>
              ))}
            </div>

            {tab === "profil" && (
              <>
                {selected.bio && (
                  <Card>
                    <div className="text-[10px] text-sage uppercase tracking-wider mb-2 font-semibold">Bio</div>
                    <p className="text-sm text-white/80 leading-relaxed">{selected.bio}</p>
                  </Card>
                )}
                {equipment && Object.keys(equipment).length > 0 && (
                  <Card>
                    <div className="text-[10px] text-sage uppercase tracking-wider mb-3 font-semibold">Matériel</div>
                    <div className="flex flex-col gap-2">
                      {Object.entries(equipment).map(([k, v]) => (
                        <div key={k}>
                          <div className="text-[10px] text-sage capitalize">{k.replace(/_/g, " ")}</div>
                          <div className="text-sm text-white">{v}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}

            {tab === "routine" && (
              <Card>
                <div className="text-[10px] text-sage uppercase tracking-wider mb-3 font-semibold">
                  Semaine type d&apos;entraînement
                </div>
                <div className="flex flex-col gap-0">
                  {routine.map((r, i) => (
                    <div key={i} className={`flex items-start gap-3 py-3 ${i < routine.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                      <div className="w-8 flex-shrink-0">
                        <span className="text-[10px] font-semibold text-sage uppercase">{r.day}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white/80">{r.focus}</div>
                      </div>
                      <div className="text-xs text-sage flex-shrink-0">{r.duration}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-[10px] text-sage/60">
                    Programme indicatif basé sur les données publiques disponibles.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </PageWrapper>
      </>
    )
  }

  return (
    <>
      <TopBar title="Classement mondial" />
      <PageWrapper>
        <div className="pt-4 flex flex-col gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
            <input
              type="text"
              placeholder="Rechercher un joueur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border border-white/25 text-white text-sm pl-9 pr-4 py-3 outline-none focus:border-green transition-colors placeholder:text-sage/50"
            />
          </div>

          {!search && (
            <div className="flex gap-2 items-end">
              {[demoPros[1], demoPros[0], demoPros[2]].map((p, i) => {
                const heights = [28, 36, 24]
                const rankOrder = [2, 1, 3]
                return (
                  <button
                    key={p?.id}
                    onClick={() => p && setSelected(p)}
                    className="flex-1 bg-green/10 border border-green/20 flex flex-col items-center justify-end p-3 transition-all hover:bg-green/20 active:scale-95"
                    style={{ height: `${heights[i] * 3}px` }}
                  >
                    <div className="text-2xl mb-1">{p?.country?.split(" ")[0]}</div>
                    <div className="font-display text-sm font-light text-white text-center leading-tight">
                      {p?.full_name?.split(" ").pop()}
                    </div>
                    <div className="font-display text-2xl text-sand">#{rankOrder[i]}</div>
                  </button>
                )
              })}
            </div>
          )}

          <Card padding="none">
            <div className="flex items-center px-4 py-2 border-b border-white/[0.06]">
              <div className="w-8 text-[10px] text-sage uppercase">#</div>
              <div className="flex-1 text-[10px] text-sage uppercase tracking-wider">Joueur</div>
              <div className="w-16 text-[10px] text-sage uppercase tracking-wider text-right">Points</div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelected(player)}
                  className="w-full flex items-center px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
                >
                  <div className="w-8">
                    <span className={`font-display text-xl ${
                      player.ittf_ranking === 1 ? "text-sand" :
                      player.ittf_ranking === 2 ? "text-cream" :
                      player.ittf_ranking === 3 ? "text-sage" : "text-white/50"
                    }`}>
                      {player.ittf_ranking}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-lg">{player.country?.split(" ")[0]}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{player.full_name}</div>
                      {player.play_style && (
                        <div className="text-[10px] text-sage">{PLAY_STYLE_LABELS[player.play_style]}</div>
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <div className="text-sm font-semibold text-white">{player.ittf_points?.toLocaleString()}</div>
                    <div className="flex items-center justify-end gap-0.5 text-green-light">
                      <TrendingUp size={10} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </PageWrapper>
    </>
  )
}
