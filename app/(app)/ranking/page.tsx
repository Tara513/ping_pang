"use client"

import { useState, useMemo } from "react"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Card from "@/components/ui/Card"
import { demoPros } from "@/lib/seeds/proPlayers"
import { Search, TrendingUp } from "lucide-react"

const PLAY_STYLE_LABELS: Record<string, string> = {
  attacker: "Attaquant", defender: "Défenseur", allround: "Polyvalent",
  penhold: "Penholder"
}

export default function RankingPage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<(typeof demoPros)[0] | null>(null)

  const filtered = useMemo(() =>
    demoPros.filter((p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.country?.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  )

  if (selected) {
    const equipment = selected.equipment as Record<string, string> | null
    return (
      <>
        <TopBar title={selected.full_name || "Joueur"} showBack onBack={() => setSelected(null)} />
        <PageWrapper>
          <div className="flex flex-col gap-4 pt-4">
            <div className="bg-kaki/10 border border-kaki/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-2xl mb-1">{selected.country?.split(" ")[0]}</div>
                  <h1 className="font-display text-4xl text-white uppercase leading-none">{selected.full_name}</h1>
                  <div className="text-olive text-sm mt-1">{selected.country?.split(" ").slice(1).join(" ")} · {selected.club}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-olive uppercase tracking-wider">Rang ITTF</div>
                  <div className="font-display text-6xl text-white">#{selected.ittf_ranking}</div>
                </div>
              </div>
              <div className="flex gap-6">
                <div>
                  <div className="text-[10px] text-olive uppercase tracking-wider">Points</div>
                  <div className="font-display text-2xl text-white">{selected.ittf_points?.toLocaleString()}</div>
                </div>
                {selected.birth_year && (
                  <div>
                    <div className="text-[10px] text-olive uppercase tracking-wider">Né en</div>
                    <div className="font-display text-2xl text-white">{selected.birth_year}</div>
                  </div>
                )}
                {selected.play_style && (
                  <div>
                    <div className="text-[10px] text-olive uppercase tracking-wider">Style</div>
                    <div className="text-sm text-white">{PLAY_STYLE_LABELS[selected.play_style] || selected.play_style}</div>
                  </div>
                )}
              </div>
            </div>

            {selected.bio && (
              <Card>
                <div className="text-[10px] text-olive uppercase tracking-wider mb-2 font-semibold">Bio</div>
                <p className="text-sm text-white/80 leading-relaxed">{selected.bio}</p>
              </Card>
            )}

            {equipment && Object.keys(equipment).length > 0 && (
              <Card>
                <div className="text-[10px] text-olive uppercase tracking-wider mb-3 font-semibold">Matériel</div>
                <div className="flex flex-col gap-2">
                  {Object.entries(equipment).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[10px] text-olive capitalize">{k.replace(/_/g, " ")}</div>
                      <div className="text-sm text-white">{v}</div>
                    </div>
                  ))}
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
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive" />
            <input
              type="text"
              placeholder="Rechercher un joueur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border border-white/25 text-white text-sm pl-9 pr-4 py-3 outline-none focus:border-olive transition-colors placeholder:text-olive/50"
            />
          </div>

          {/* Podium */}
          {!search && (
            <div className="flex gap-2 items-end">
              {[demoPros[1], demoPros[0], demoPros[2]].map((p, i) => {
                const heights = [28, 36, 24]
                const rankOrder = [2, 1, 3]
                return (
                  <button
                    key={p?.id}
                    onClick={() => p && setSelected(p)}
                    className="flex-1 bg-kaki/10 border border-kaki/20 flex flex-col items-center justify-end p-3 transition-all hover:bg-kaki/20 active:scale-95"
                    style={{ height: `${heights[i] * 3}px` }}
                  >
                    <div className="text-2xl mb-1">{p?.country?.split(" ")[0]}</div>
                    <div className="font-display text-sm text-white uppercase text-center leading-tight">
                      {p?.full_name?.split(" ").pop()}
                    </div>
                    <div className="font-display text-2xl text-yellow">#{rankOrder[i]}</div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Table */}
          <Card padding="none">
            <div className="flex items-center px-4 py-2 border-b border-white/[0.06]">
              <div className="w-8 text-[10px] text-olive uppercase">#</div>
              <div className="flex-1 text-[10px] text-olive uppercase tracking-wider">Joueur</div>
              <div className="w-16 text-[10px] text-olive uppercase tracking-wider text-right">Points</div>
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
                      player.ittf_ranking === 1 ? "text-yellow" :
                      player.ittf_ranking === 2 ? "text-beige" :
                      player.ittf_ranking === 3 ? "text-olive" : "text-white/50"
                    }`}>
                      {player.ittf_ranking}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-lg">{player.country?.split(" ")[0]}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{player.full_name}</div>
                      {player.play_style && (
                        <div className="text-[10px] text-olive">{PLAY_STYLE_LABELS[player.play_style]}</div>
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <div className="text-sm font-semibold text-white">{player.ittf_points?.toLocaleString()}</div>
                    <div className="flex items-center justify-end gap-0.5 text-kaki">
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
