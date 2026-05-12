"use client"

import { useState, useMemo } from "react"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import { demoPros } from "@/lib/seeds/proPlayers"

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
    { day: "Sam", focus: "Tournoi ou compétition", duration: "Journée" },
    { day: "Dim", focus: "Repos", duration: "—" },
  ],
}

const DEFAULT_ROUTINE = [
  { day: "Lun", focus: "Technique — entraînement spécifique", duration: "2h30" },
  { day: "Mar", focus: "Physique et condition physique", duration: "1h30" },
  { day: "Mer", focus: "Service et tactique", duration: "2h" },
  { day: "Jeu", focus: "Sparring et matchs d'entraînement", duration: "2h30" },
  { day: "Ven", focus: "Technique — points faibles", duration: "2h" },
  { day: "Sam", focus: "Compétition officielle", duration: "Journée" },
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
        <PageWrapper noPadding>
          {/* Hero */}
          <div className="bg-green px-4 pt-8 pb-7">
            <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-1">
              {selected.country?.split(" ")[0]} {selected.country?.split(" ").slice(1).join(" ")}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display font-light text-white leading-none" style={{ fontSize: 48 }}>
                  {selected.full_name}
                </div>
                <div className="text-[11px] text-sage mt-2">{selected.club}</div>
              </div>
              <div className="text-right pb-2">
                <div className="font-display font-light text-white leading-none" style={{ fontSize: 56 }}>
                  #{selected.ittf_ranking}
                </div>
                <div className="text-[9px] text-sage uppercase tracking-widest mt-1">ITTF</div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex border-b border-white/[0.06]">
            {[
              { label: "Points", value: selected.ittf_points?.toLocaleString() },
              { label: "Naissance", value: selected.birth_year },
              { label: "Style", value: selected.play_style ? PLAY_STYLE_LABELS[selected.play_style] || selected.play_style : "—" },
            ].map((s, i) => (
              <div
                key={i}
                className={`flex-1 py-4 text-center ${i < 2 ? "border-r border-white/[0.06]" : ""}`}
              >
                <div className="font-display text-xl font-light text-white">{s.value || "—"}</div>
                <div className="text-[9px] text-sage uppercase tracking-widest mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06]">
            {(["profil", "routine"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-[9px] uppercase tracking-[0.2em] border-b-2 -mb-px transition-all ${
                  tab === t ? "border-white text-white" : "border-transparent text-sage/50"
                }`}
              >
                {t === "profil" ? "Profil" : "Routine"}
              </button>
            ))}
          </div>

          <div className="px-4 py-4">
            {tab === "profil" && (
              <>
                {selected.bio && (
                  <div className="mb-6">
                    <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-3">Bio</div>
                    <div className="border-l-2 border-white/10 pl-4">
                      <p className="text-sm text-white/70 leading-relaxed font-sans">{selected.bio}</p>
                    </div>
                  </div>
                )}
                {equipment && Object.keys(equipment).length > 0 && (
                  <div>
                    <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-3">Matériel</div>
                    {Object.entries(equipment).map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between py-3 border-b border-white/[0.05]">
                        <div className="text-[9px] text-sage uppercase tracking-[0.15em] capitalize">{k.replace(/_/g, " ")}</div>
                        <div className="text-sm text-white font-sans">{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "routine" && (
              <div>
                <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-4">Semaine type</div>
                {routine.map((r, i) => (
                  <div key={i} className="flex items-start gap-4 py-4 border-b border-white/[0.05]">
                    <div className="text-[9px] text-sage uppercase tracking-widest w-8 flex-shrink-0 mt-0.5">{r.day}</div>
                    <div className="flex-1 text-sm text-white/70 font-sans">{r.focus}</div>
                    <div className="text-[10px] text-sage flex-shrink-0">{r.duration}</div>
                  </div>
                ))}
                <p className="text-[9px] text-sage/40 mt-4">Programme indicatif basé sur les données publiques.</p>
              </div>
            )}
          </div>
        </PageWrapper>
      </>
    )
  }

  return (
    <>
      <TopBar title="Classement" />
      <PageWrapper noPadding>
        {/* Search */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-white/15 text-white text-sm pb-2 outline-none focus:border-white/40 transition-colors placeholder:text-sage/30 font-sans"
          />
        </div>

        {/* Podium */}
        {!search && (
          <div className="px-4 pt-6 pb-2">
            <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-4">Top 3 mondial</div>
            <div className="flex items-end gap-2 h-32">
              {[demoPros[1], demoPros[0], demoPros[2]].map((p, i) => {
                const heights = ["80%", "100%", "65%"]
                const rankOrder = [2, 1, 3]
                return (
                  <button
                    key={p?.id}
                    onClick={() => p && setSelected(p)}
                    className="flex-1 flex flex-col items-center justify-end pb-3 border border-white/[0.08] hover:border-white/20 transition-all bg-surface"
                    style={{ height: heights[i] }}
                  >
                    <div className="text-xl mb-1">{p?.country?.split(" ")[0]}</div>
                    <div className="font-display text-xs font-light text-white/70 text-center leading-tight px-1">
                      {p?.full_name?.split(" ").pop()}
                    </div>
                    <div className={`font-display text-xl mt-0.5 ${i === 1 ? "text-sand" : "text-white/40"}`}>
                      #{rankOrder[i]}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* List */}
        <div className={search ? "" : "mt-4 border-t border-white/[0.06]"}>
          <div className="flex items-center px-4 py-2 border-b border-white/[0.06]">
            <div className="w-8 text-[9px] text-sage/40 uppercase tracking-widest">#</div>
            <div className="flex-1 text-[9px] text-sage/40 uppercase tracking-widest">Joueur</div>
            <div className="text-[9px] text-sage/40 uppercase tracking-widest">Points</div>
          </div>
          {filtered.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelected(player)}
              className="w-full flex items-center px-4 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors text-left"
            >
              <div className="w-8">
                <span className={`font-display text-xl font-light ${
                  player.ittf_ranking === 1 ? "text-sand" :
                  player.ittf_ranking === 2 ? "text-cream/80" :
                  player.ittf_ranking === 3 ? "text-sage" : "text-white/30"
                }`}>
                  {player.ittf_ranking}
                </span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <span className="text-lg">{player.country?.split(" ")[0]}</span>
                <div>
                  <div className="text-sm text-white font-sans">{player.full_name}</div>
                  {player.play_style && (
                    <div className="text-[10px] text-sage/50">{PLAY_STYLE_LABELS[player.play_style]}</div>
                  )}
                </div>
              </div>
              <div className="font-display text-xl font-light text-white/60">
                {player.ittf_points?.toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </PageWrapper>
    </>
  )
}
