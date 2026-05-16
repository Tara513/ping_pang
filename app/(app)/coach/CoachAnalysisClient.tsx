"use client"

import { useMemo, useState } from "react"
import type { CoachMatchAnalysis, CoachPageData } from "@/lib/data/coach"
import { AnalysisHistory } from "./components/AnalysisHistory"
import { MatchAnalysisPanel } from "./components/MatchAnalysisPanel"
import { MatchPicker } from "./components/MatchPicker"

type ApiAnalysis = CoachMatchAnalysis & {
  user_id?: string
  generated_at?: string
}

function normalizeAnalysis(payload: ApiAnalysis): CoachMatchAnalysis {
  return {
    id: payload.id,
    match_id: payload.match_id,
    player_id: payload.player_id || payload.user_id || "",
    rating: payload.rating ?? null,
    summary: payload.summary || "Analyse générée.",
    strengths: Array.isArray(payload.strengths) ? payload.strengths : [],
    weaknesses: Array.isArray(payload.weaknesses) ? payload.weaknesses : [],
    critical_moments: Array.isArray(payload.critical_moments) ? payload.critical_moments : [],
    recommendations: Array.isArray(payload.recommendations) ? payload.recommendations : [],
    model_used: payload.model_used ?? null,
    created_at: payload.created_at || payload.generated_at || new Date().toISOString(),
  }
}

export function CoachAnalysisClient({ initialData }: { initialData: CoachPageData }) {
  const [analyses, setAnalyses] = useState(initialData.analyses)
  const [selectedMatchId, setSelectedMatchId] = useState(initialData.matches[0]?.id ?? "")
  const [standaloneAnalysisId, setStandaloneAnalysisId] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const matchesById = useMemo(() => {
    return new Map(initialData.matches.map((match) => [match.id, match]))
  }, [initialData.matches])

  const analysesByMatch = useMemo(() => {
    return new Map(analyses.map((analysis) => [analysis.match_id, analysis]))
  }, [analyses])

  const selectedMatch = standaloneAnalysisId
    ? null
    : initialData.matches.find((match) => match.id === selectedMatchId) ?? initialData.matches[0] ?? null
  const selectedAnalysis = standaloneAnalysisId
    ? analyses.find((analysis) => analysis.id === standaloneAnalysisId) ?? null
    : selectedMatch
    ? analysesByMatch.get(selectedMatch.id) ?? null
    : null

  async function analyzeSelectedMatch() {
    if (!selectedMatch) return

    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const response = await fetch("/api/analyze-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: selectedMatch.id }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || "Analyse impossible")
      }

      const analysis = normalizeAnalysis(payload as ApiAnalysis)
      setAnalyses((current) => {
        const withoutDuplicate = current.filter((item) => item.match_id !== analysis.match_id)
        return [analysis, ...withoutDuplicate]
      })
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Analyse impossible")
    } finally {
      setAnalyzing(false)
    }
  }

  function selectMatch(matchId: string) {
    setStandaloneAnalysisId(null)
    setSelectedMatchId(matchId)
    setAnalysisError(null)
  }

  function selectAnalysis(analysis: CoachMatchAnalysis) {
    const match = matchesById.get(analysis.match_id)
    if (match) {
      setSelectedMatchId(match.id)
      setStandaloneAnalysisId(null)
    } else {
      setStandaloneAnalysisId(analysis.id)
    }
    setAnalysisError(null)
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <MatchPicker
          matches={initialData.matches}
          selectedMatchId={selectedMatch?.id ?? ""}
          analysesByMatch={analysesByMatch}
          onSelect={selectMatch}
        />
        <MatchAnalysisPanel
          match={selectedMatch}
          analysis={selectedAnalysis}
          readOnlyTitle={standaloneAnalysisId ? "Match non disponible" : undefined}
          analyzing={analyzing}
          error={analysisError}
          onAnalyze={analyzeSelectedMatch}
        />
      </section>

      <section id="history">
        <AnalysisHistory
          analyses={analyses}
          matchesById={matchesById}
          selectedAnalysisId={selectedAnalysis?.id ?? null}
          onSelect={selectAnalysis}
        />
      </section>
    </div>
  )
}
