"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import BallTrackingSection from "@/components/ball-tracking/BallTrackingSection"
import type { Match } from "@/types/database"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { demoMatches } from "@/lib/seeds/demoData"
import { Sparkles } from "lucide-react"

const MATCH_LABELS: Record<string, string> = {
  friendly: "Amical", league: "Championnat", tournament: "Tournoi", training: "Entraînement",
}

interface MatchAnalysis {
  rating: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  critical_moments: string[]
  recommendations: string[]
}

function AnalysisSection({ match }: { match: Match }) {
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/analyze-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAnalysis(data)
    } catch {
      setError("Erreur lors de l'analyse. Réessaie.")
    } finally {
      setLoading(false)
    }
  }

  if (!analysis && !loading) {
    return (
      <Card className="border-green/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-green-light" />
          <div className="text-[10px] text-green-light uppercase tracking-wider font-semibold">Analyse IA</div>
        </div>
        <p className="text-xs text-sage mb-3">Analyse ton match comme chess.com avec l&apos;IA Mistral.</p>
        <Button onClick={analyze} size="sm" variant="secondary">
          Analyser ce match
        </Button>
        {error && <p className="text-xs text-red mt-2">{error}</p>}
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="border-green/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-green-light animate-pulse" />
          <div className="text-[10px] text-green-light uppercase tracking-wider font-semibold">Analyse en cours...</div>
        </div>
        <div className="flex flex-col gap-2 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-3 bg-surface rounded" />
          ))}
        </div>
      </Card>
    )
  }

  if (!analysis) return null

  const ratingColor = analysis.rating >= 70 ? "#4A5240" : analysis.rating >= 50 ? "#E8C840" : "#C8352A"

  return (
    <Card className="border-green/20">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-green-light" />
        <div className="text-[10px] text-green-light uppercase tracking-wider font-semibold">Analyse IA Mistral</div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
        <div className="text-center">
          <div className="font-display text-6xl leading-none" style={{ color: ratingColor }}>
            {analysis.rating}
          </div>
          <div className="text-[10px] text-sage mt-1">/ 100</div>
        </div>
        <p className="text-sm text-white/80 flex-1 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Points forts */}
      <div className="mb-3">
        <div className="text-[10px] text-green-light uppercase tracking-wider mb-2 font-semibold">Points forts</div>
        <div className="flex flex-col gap-1.5">
          {analysis.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/80">
              <span className="text-green-light mt-0.5 flex-shrink-0">✓</span>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Points à améliorer */}
      <div className="mb-3">
        <div className="text-[10px] text-sage uppercase tracking-wider mb-2 font-semibold">À améliorer</div>
        <div className="flex flex-col gap-1.5">
          {analysis.weaknesses.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/80">
              <span className="text-red mt-0.5 flex-shrink-0">→</span>
              {w}
            </div>
          ))}
        </div>
      </div>

      {/* Moments clés */}
      {analysis.critical_moments?.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] text-sand uppercase tracking-wider mb-2 font-semibold">Moments clés</div>
          <div className="flex flex-col gap-1.5">
            {analysis.critical_moments.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-sand mt-0.5 flex-shrink-0">⚡</span>
                {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommandations */}
      <div className="pt-3 border-t border-white/10">
        <div className="text-[10px] text-white uppercase tracking-wider mb-2 font-semibold">Recommandations</div>
        <div className="flex flex-col gap-2">
          {analysis.recommendations.map((r, i) => (
            <div key={i} className="bg-green/10 border border-green/20 px-3 py-2 text-sm text-white/80">
              {i + 1}. {r}
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setAnalysis(null)} className="text-[10px] text-sage hover:text-white transition-colors mt-3">
        Relancer l&apos;analyse
      </button>
    </Card>
  )
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
              <div key={i} className="bg-surface border border-white/[0.08] h-28" />
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
        <PageWrapper><div className="text-center py-20 text-sage">Match introuvable</div></PageWrapper>
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
          <div className={`p-5 border ${isWin ? "bg-green/10 border-green/30" : "bg-red/10 border-red/30"}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Badge label={isWin ? "Victoire" : "Défaite"} color={isWin ? "green" : "red"} size="md" />
                <div className="text-sage text-sm mt-1 capitalize">{dateStr}</div>
              </div>
              <div className="text-right">
                <Badge label={MATCH_LABELS[match.match_type] || match.match_type} color="surface" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 text-center">
                <div className="text-xs text-sage uppercase tracking-wider mb-1">Toi</div>
                <div className={`font-display text-6xl leading-none ${isWin ? "text-green-light" : "text-white"}`}>{match.sets_won}</div>
              </div>
              <div className="text-white/30 font-display text-3xl">—</div>
              <div className="flex-1 text-center">
                <div className="text-xs text-sage uppercase tracking-wider mb-1">{match.opponent_name}</div>
                <div className={`font-display text-6xl leading-none ${!isWin ? "text-red" : "text-white"}`}>{match.sets_lost}</div>
              </div>
            </div>
          </div>

          {/* Score par set */}
          {match.score_player?.length > 0 && (
            <Card>
              <div className="text-[10px] text-sage uppercase tracking-wider mb-3 font-semibold">Score par set</div>
              <div className="flex flex-col gap-2">
                {match.score_player.map((p, i) => {
                  const o = match.score_opponent[i] || 0
                  const setWon = p > o
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-xs text-sage w-8">Set {i + 1}</div>
                      <div className="flex-1 flex items-center gap-2">
                        <span className={`font-display text-2xl ${setWon ? "text-green-light" : "text-white"}`}>{p}</span>
                        <span className="text-sage">—</span>
                        <span className={`font-display text-2xl ${!setWon ? "text-red" : "text-white"}`}>{o}</span>
                      </div>
                      <Badge label={setWon ? "✓" : "✗"} color={setWon ? "green" : "red"} />
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Analyse IA */}
          <AnalysisSection match={match} />

          {match.location && (
            <Card>
              <div className="text-[10px] text-sage uppercase tracking-wider mb-1 font-semibold">Lieu</div>
              <div className="text-sm text-white">📍 {match.location}</div>
            </Card>
          )}

          {match.notes && (
            <Card>
              <div className="text-[10px] text-sage uppercase tracking-wider mb-2 font-semibold">Notes</div>
              <p className="text-sm text-white/80 leading-relaxed">{match.notes}</p>
            </Card>
          )}

          {match.ball_data && <BallTrackingSection data={match.ball_data} />}
        </div>
      </PageWrapper>
    </>
  )
}
