"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle } from "@/components/ui/Card"
import { formatDate } from "@/lib/utils/format"
import { Sparkles } from "lucide-react"
import type { CoachAnalysisItem, CoachMatchItem } from "../types"
import { AnalysisSection } from "./AnalysisSection"

function resultLabel(match: CoachMatchItem) {
  if (match.result === "win") return "Victoire"
  if (match.result === "loss") return "Défaite"
  return "Résultat inconnu"
}

function scoreLabel(match: CoachMatchItem) {
  return match.sets_won !== null && match.sets_lost !== null ? `${match.sets_won}/${match.sets_lost}` : "-"
}

export function MatchAnalysisPanel({
  match,
  analysis,
  readOnlyTitle,
  analyzing,
  error,
  onAnalyze,
}: {
  match: CoachMatchItem | null
  analysis: CoachAnalysisItem | null
  readOnlyTitle?: string
  analyzing: boolean
  error: string | null
  onAnalyze: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasLongAnalysis =
    analysis &&
    [...analysis.strengths, ...analysis.weaknesses, ...analysis.critical_moments, ...analysis.recommendations].length > 8

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>Analyse match</CardTitle>
          <p className="text-sm text-onyx-400">
            {match ? `vs ${match.opponent_name}` : readOnlyTitle || "Analyse en lecture seule"}
          </p>
        </div>
        {analysis?.rating !== null && analysis?.rating !== undefined && (
          <Badge variant="lime">{analysis.rating}/100</Badge>
        )}
      </div>

      {match && (
        <div className="rounded-[8px] bg-onyx-50 p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="break-words text-sm font-semibold text-onyx">vs {match.opponent_name}</p>
            {match.source === "ranking" && <Badge variant="info">PGR</Badge>}
            <Badge variant={match.result === "win" ? "success" : "default"}>{resultLabel(match)}</Badge>
          </div>
          <p className="text-sm text-onyx-500">
            Score {scoreLabel(match)} · {formatDate(match.date)}
          </p>
          {match.sets.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {match.sets.map((set, index) => (
                <div key={`${match.id}-set-${index}`} className="rounded-[6px] bg-white px-3 py-2 text-sm text-onyx-700">
                  <span className="text-onyx-400">Set {index + 1}</span>
                  <span className="float-right font-semibold text-onyx">{set.player}-{set.opponent}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!analysis && match && (
        <div className="space-y-2">
          <Button variant="primary" icon={Sparkles} loading={analyzing} onClick={onAnalyze} fullWidth>
            Analyser ce match
          </Button>
          {error && <p className="text-sm text-mauve">{error}</p>}
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="rounded-[8px] bg-evergreen/5 border border-evergreen/20 p-3">
            <p className="break-words text-sm leading-relaxed text-onyx-700">{analysis.summary}</p>
          </div>

          <AnalysisSection title="Points forts" items={expanded ? analysis.strengths : analysis.strengths.slice(0, 3)} tone="strength" />
          <AnalysisSection title="Points faibles" items={expanded ? analysis.weaknesses : analysis.weaknesses.slice(0, 3)} tone="weakness" />
          <AnalysisSection title="Moments clés" items={expanded ? analysis.critical_moments : analysis.critical_moments.slice(0, 3)} tone="moment" />
          <AnalysisSection title="Recommandations" items={expanded ? analysis.recommendations : analysis.recommendations.slice(0, 4)} tone="recommendation" />

          {hasLongAnalysis && (
            <Button variant="outline" size="sm" onClick={() => setExpanded((value) => !value)}>
              {expanded ? "Réduire" : "Voir détail"}
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
