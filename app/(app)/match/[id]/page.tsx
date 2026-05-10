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
              <div key={i} className="bg-ppp-card border border-ppp-border h-28 rounded-md" />
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
        <PageWrapper>
          <div className="text-center py-20 text-ppp-muted font-serif">Match introuvable</div>
        </PageWrapper>
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
          <div className={`p-5 rounded-md ${isWin ? "bg-ppp-forest" : "bg-red/90"}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Badge
                  label={isWin ? "Victoire" : "Défaite"}
                  color={isWin ? "muted" : "muted"}
                  size="md"
                />
                <div className="text-ppp-white/60 text-sm mt-1 capitalize font-serif">{dateStr}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-serif font-semibold uppercase tracking-wide text-ppp-white/70">
                  {MATCH_LABELS[match.match_type] || match.match_type}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 text-center">
                <div className="text-xs text-ppp-white/50 uppercase tracking-wider mb-1 font-serif">Toi</div>
                <div className="font-serif font-bold text-6xl leading-none text-ppp-white">
                  {match.sets_won}
                </div>
              </div>
              <div className="text-ppp-white/30 font-serif text-3xl">—</div>
              <div className="flex-1 text-center">
                <div className="text-xs text-ppp-white/50 uppercase tracking-wider mb-1 font-serif">{match.opponent_name}</div>
                <div className="font-serif font-bold text-6xl leading-none text-ppp-white">
                  {match.sets_lost}
                </div>
              </div>
            </div>
          </div>

          {/* Score par set */}
          {match.score_player?.length > 0 && (
            <Card>
              <div className="text-[10px] text-ppp-muted uppercase tracking-wider mb-3 font-semibold">Score par set</div>
              <div className="flex flex-col gap-2">
                {match.score_player.map((p, i) => {
                  const o = match.score_opponent[i] || 0
                  const setWon = p > o
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-xs text-ppp-muted font-serif w-8">Set {i + 1}</div>
                      <div className="flex-1 flex items-center gap-2">
                        <span className={`font-serif font-bold text-2xl ${setWon ? "text-ppp-forest" : "text-ppp-text"}`}>{p}</span>
                        <span className="text-ppp-muted">—</span>
                        <span className={`font-serif font-bold text-2xl ${!setWon ? "text-red" : "text-ppp-text"}`}>{o}</span>
                      </div>
                      <Badge label={setWon ? "✓" : "✗"} color={setWon ? "forest" : "red"} />
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Info */}
          {match.location && (
            <Card>
              <div className="text-[10px] text-ppp-muted uppercase tracking-wider mb-1 font-semibold">Lieu</div>
              <div className="text-sm text-ppp-text font-serif">📍 {match.location}</div>
            </Card>
          )}

          {/* Notes */}
          {match.notes && (
            <Card>
              <div className="text-[10px] text-ppp-muted uppercase tracking-wider mb-2 font-semibold">Notes</div>
              <p className="text-sm text-ppp-text/80 font-serif leading-relaxed">{match.notes}</p>
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
