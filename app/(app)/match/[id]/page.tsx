"use client"

export const dynamic = "force-dynamic"


import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import BallTrackingSection from "@/components/ball-tracking/BallTrackingSection"
import type { Match } from "@/types/database"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { demoMatches } from "@/lib/seeds/demoData"
import { MapPin } from "lucide-react"

const MATCH_LABELS: Record<string, string> = {
  friendly: "Amical", league: "Championnat", tournament: "Tournoi", training: "Entraînement"
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("matches").select("*").eq("id", id).single()
      if (data) {
        setMatch(data)
      } else {
        const demo = (demoMatches as Partial<Match>[]).find((m) => m.id === id)
        if (demo) setMatch(demo as Match)
      }
      setLoading(false)
    }
    load()
  }, [id, supabase])

  if (loading) {
    return (
      <>
        <TopBar title="Match" showBack />
        <PageWrapper>
          <div className="flex flex-col gap-4 pt-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-anthracite border border-white/[0.08] h-28" />
            ))}
          </div>
        </PageWrapper>
      </>
    )
  }

  if (!match) {
    return (
      <>
        <TopBar title="Match" showBack />
        <PageWrapper><div className="text-center py-20 text-olive">Match introuvable</div></PageWrapper>
      </>
    )
  }

  const isWin = match.result === "win"
  const dateStr = format(new Date(match.date), "EEEE d MMMM yyyy", { locale: fr })

  return (
    <>
      <TopBar title="Match" showBack />
      <PageWrapper>
        <div className="pt-4 flex flex-col gap-4">
          {/* Result header */}
          <div className={`p-5 border ${isWin ? "bg-kaki/10 border-kaki/30" : "bg-red/10 border-red/30"}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Badge
                  label={isWin ? "Victoire" : "Défaite"}
                  color={isWin ? "kaki" : "red"}
                  size="md"
                />
                <div className="text-olive text-sm mt-1 capitalize">{dateStr}</div>
              </div>
              <div className="text-right">
                <Badge label={MATCH_LABELS[match.match_type] || match.match_type} color="anthracite" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 text-center">
                <div className="text-xs text-olive uppercase tracking-wider mb-1">Toi</div>
                <div className={`font-display text-6xl leading-none ${isWin ? "text-kaki" : "text-white"}`}>
                  {match.sets_won}
                </div>
              </div>
              <div className="text-white/30 font-display text-3xl">—</div>
              <div className="flex-1 text-center">
                <div className="text-xs text-olive uppercase tracking-wider mb-1">{match.opponent_name}</div>
                <div className={`font-display text-6xl leading-none ${!isWin ? "text-red" : "text-white"}`}>
                  {match.sets_lost}
                </div>
              </div>
            </div>
          </div>

          {/* Score par set */}
          {match.score_player?.length > 0 && (
            <Card>
              <div className="text-[10px] text-olive uppercase tracking-wider mb-3 font-semibold">Score par set</div>
              <div className="flex flex-col gap-2">
                {match.score_player.map((p, i) => {
                  const o = match.score_opponent[i] || 0
                  const setWon = p > o
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-xs text-olive w-8">Set {i + 1}</div>
                      <div className="flex-1 flex items-center gap-2">
                        <span className={`font-display text-2xl ${setWon ? "text-kaki" : "text-white"}`}>{p}</span>
                        <span className="text-olive">—</span>
                        <span className={`font-display text-2xl ${!setWon ? "text-red" : "text-white"}`}>{o}</span>
                      </div>
                      <Badge label={setWon ? "✓" : "✗"} color={setWon ? "kaki" : "red"} />
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Info */}
          {match.location && (
            <Card>
              <div className="text-[10px] text-olive uppercase tracking-wider mb-1 font-semibold">Lieu</div>
              <div className="text-sm text-white flex items-center gap-1"><MapPin size={12} strokeWidth={1.5} /> {match.location}</div>
            </Card>
          )}

          {/* Notes */}
          {match.notes && (
            <Card>
              <div className="text-[10px] text-olive uppercase tracking-wider mb-2 font-semibold">Notes</div>
              <p className="text-sm text-white/80 leading-relaxed">{match.notes}</p>
            </Card>
          )}

          {/* Ball tracking */}
          {match.ball_data && (
            <BallTrackingSection data={match.ball_data} />
          )}
        </div>
      </PageWrapper>
    </>
  )
}
