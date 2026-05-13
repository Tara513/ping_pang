"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Button from "@/components/ui/Button"
import BallTrackingSection from "@/components/ball-tracking/BallTrackingSection"
import type { Match } from "@/types/database"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { demoMatches } from "@/lib/seeds/demoData"
import { allowDemoData } from "@/lib/demo"
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
    if (!match.id) {
      setError("Analyse indisponible pour ce match.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/analyze-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: match.id }),
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
      <div className="py-6 border-t border-white/[0.05]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={12} className="text-sage" />
          <div className="text-[9px] text-sage uppercase tracking-[0.2em]">Analyse IA</div>
        </div>
        <p className="text-[11px] text-sage/60 mb-4 font-sans leading-relaxed">
          Analyse ton match avec l&apos;IA — comme chess.com pour le ping.
        </p>
        <Button onClick={analyze} size="sm" variant="secondary">
          Analyser ce match
        </Button>
        {error && <p className="text-[11px] text-red mt-3">{error}</p>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="py-6 border-t border-white/[0.05]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={12} className="text-sage animate-pulse" />
          <div className="text-[9px] text-sage uppercase tracking-[0.2em]">Analyse en cours…</div>
        </div>
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-3 bg-surface" />)}
        </div>
      </div>
    )
  }

  if (!analysis) return null

  const ratingColor = analysis.rating >= 70 ? "#1A5C4A" : analysis.rating >= 50 ? "#D4C9B5" : "#C72927"

  return (
    <div className="py-6 border-t border-white/[0.05]">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={12} className="text-green-light" />
        <div className="text-[9px] text-green-light uppercase tracking-[0.2em]">Analyse IA Mistral</div>
      </div>

      {/* Rating */}
      <div className="flex items-end gap-6 mb-6 pb-6 border-b border-white/[0.05]">
        <div>
          <div className="font-display font-light leading-none" style={{ fontSize: 80, color: ratingColor }}>
            {analysis.rating}
          </div>
          <div className="text-[9px] text-sage uppercase tracking-widest mt-1">/ 100</div>
        </div>
        <p className="text-sm text-white/70 leading-relaxed font-sans flex-1 pb-2">{analysis.summary}</p>
      </div>

      {/* Points forts */}
      <div className="mb-5">
        <div className="text-[9px] text-green-light uppercase tracking-[0.2em] mb-3">Points forts</div>
        {analysis.strengths.map((s, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.04]">
            <span className="text-green-light text-[10px] mt-0.5 flex-shrink-0">✓</span>
            <span className="text-sm text-white/70 font-sans">{s}</span>
          </div>
        ))}
      </div>

      {/* À améliorer */}
      <div className="mb-5">
        <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-3">À améliorer</div>
        {analysis.weaknesses.map((w, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.04]">
            <span className="text-red text-[10px] mt-0.5 flex-shrink-0">→</span>
            <span className="text-sm text-white/70 font-sans">{w}</span>
          </div>
        ))}
      </div>

      {/* Moments clés */}
      {analysis.critical_moments?.length > 0 && (
        <div className="mb-5">
          <div className="text-[9px] text-sand uppercase tracking-[0.2em] mb-3">Moments clés</div>
          {analysis.critical_moments.map((m, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.04]">
              <span className="text-sand text-[10px] mt-0.5 flex-shrink-0">⚡</span>
              <span className="text-sm text-white/70 font-sans">{m}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommandations */}
      <div>
        <div className="text-[9px] text-white uppercase tracking-[0.2em] mb-3">Recommandations</div>
        {analysis.recommendations.map((r, i) => (
          <div key={i} className="flex items-start gap-3 py-3 border-b border-white/[0.04]">
            <span className="text-[9px] text-sage flex-shrink-0 mt-0.5 font-sans">{i + 1}</span>
            <span className="text-sm text-white/70 font-sans">{r}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setAnalysis(null)}
        className="text-[10px] text-sage/40 hover:text-sage transition-colors mt-4 uppercase tracking-widest"
      >
        Relancer l&apos;analyse
      </button>
    </div>
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
      if (data) setMatch(data)
      else if (allowDemoData) {
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
          <div className="animate-pulse space-y-4 pt-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-surface" />)}
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
          <div className="text-center py-24">
            <div className="font-display text-6xl font-light text-white/10">?</div>
            <div className="text-[10px] text-sage uppercase tracking-[0.2em] mt-3">Match introuvable</div>
          </div>
        </PageWrapper>
      </>
    )
  }

  const isWin = match.result === "win"
  const dateStr = format(new Date(match.date), "EEEE d MMMM yyyy", { locale: fr })

  return (
    <>
      <TopBar title="Match" showBack />
      <PageWrapper noPadding>
        {/* Hero — full bleed */}
        <div className={`px-4 pt-8 pb-7 ${isWin ? "bg-green" : "bg-red/15"}`}>
          <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-1">
            {MATCH_LABELS[match.match_type] || match.match_type}
          </div>
          <div className="text-[11px] text-sage/70 capitalize mb-6">{dateStr}</div>

          <div className="flex items-center gap-6">
            <div className="text-center flex-1">
              <div className="text-[9px] text-sage uppercase tracking-widest mb-1">Toi</div>
              <div
                className={`font-display font-light leading-none ${isWin ? "text-white" : "text-white/40"}`}
                style={{ fontSize: 88 }}
              >
                {match.sets_won}
              </div>
            </div>
            <div className="text-white/20 font-display font-light" style={{ fontSize: 40 }}>—</div>
            <div className="text-center flex-1">
              <div className="text-[9px] text-sage uppercase tracking-widest mb-1">{match.opponent_name}</div>
              <div
                className={`font-display font-light leading-none ${!isWin ? "text-red" : "text-white/40"}`}
                style={{ fontSize: 88 }}
              >
                {match.sets_lost}
              </div>
            </div>
          </div>

          <div className={`mt-5 self-start inline-block text-[9px] uppercase tracking-widest border px-3 py-1 ${
            isWin ? "border-white text-white" : "border-red text-red"
          }`}>
            {isWin ? "Victoire" : "Défaite"}
          </div>
        </div>

        <div className="px-4 py-4">
          {/* Score par set */}
          {match.score_player?.length > 0 && (
            <div className="mb-6">
              <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-3">Score par set</div>
              {match.score_player.map((p, i) => {
                const o = match.score_opponent[i] || 0
                const setWon = p > o
                return (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-white/[0.05]">
                    <div className="text-[9px] text-sage/50 uppercase tracking-widest w-8">S{i + 1}</div>
                    <div className="flex-1 flex items-center gap-3">
                      <span className={`font-display text-2xl font-light ${setWon ? "text-white" : "text-white/40"}`}>{p}</span>
                      <span className="text-white/20">—</span>
                      <span className={`font-display text-2xl font-light ${!setWon ? "text-red" : "text-white/40"}`}>{o}</span>
                    </div>
                    <div className={`text-[9px] uppercase tracking-widest ${setWon ? "text-green-light" : "text-red"}`}>
                      {setWon ? "✓" : "✗"}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Lieu */}
          {match.location && (
            <div className="py-4 border-b border-white/[0.05] mb-0">
              <div className="text-[9px] text-sage uppercase tracking-[0.2em]">Lieu</div>
              <div className="text-sm text-white mt-1 font-sans">{match.location}</div>
            </div>
          )}

          {/* Notes */}
          {match.notes && (
            <div className="py-4 border-b border-white/[0.05]">
              <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-3">Notes</div>
              <div className="border-l-2 border-white/10 pl-4">
                <p className="text-sm text-white/70 leading-relaxed font-sans">{match.notes}</p>
              </div>
            </div>
          )}

          {/* Analyse IA */}
          <AnalysisSection match={match} />

          {match.ball_data && <BallTrackingSection data={match.ball_data} />}
        </div>
      </PageWrapper>
    </>
  )
}
