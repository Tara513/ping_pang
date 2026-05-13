'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Brain, RefreshCw, TrendingUp, TrendingDown, Lightbulb, Dumbbell } from 'lucide-react'
import type { MatchAnalysis } from '@/lib/types'
import { getAnalysis, generateAnalysis } from '@/lib/api'
import { mockExercises } from '@/lib/mock-data'

export default function MatchAnalysisPage() {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getAnalysis(id as string).then(a => { setAnalysis(a); setLoading(false) })
  }, [id])

  const generate = async () => {
    setGenerating(true)
    const a = await generateAnalysis(id as string)
    setAnalysis(a)
    setGenerating(false)
  }

  if (loading) return <PageLoader />

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="size-16 rounded-full bg-evergreen/10 flex items-center justify-center">
          <Brain size={28} className="text-evergreen animate-pulse" />
        </div>
        <h3 className="font-heading font-bold text-lg text-onyx">Génération en cours…</h3>
        <p className="text-sm text-onyx-400 text-center max-w-[240px]">
          L'IA analyse ton match et prépare tes recommandations
        </p>
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="size-16 rounded-full bg-onyx-50 flex items-center justify-center">
          <Brain size={28} className="text-onyx-400" />
        </div>
        <h3 className="font-heading font-bold text-lg text-onyx">Aucune analyse</h3>
        <p className="text-sm text-onyx-400 text-center max-w-[240px]">
          Lance l'analyse IA pour obtenir un retour détaillé sur ce match
        </p>
        <Button variant="primary" icon={Brain} onClick={generate}>Analyser avec l'IA</Button>
      </div>
    )
  }

  const suggestedExercises = analysis.suggested_exercise_ids.map(id => mockExercises.find(e => e.id === id)).filter(Boolean)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-evergreen" />
          <h2 className="font-heading font-bold text-xl text-onyx">Analyse IA</h2>
        </div>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={generate}>Regénérer</Button>
      </div>

      {/* Summary */}
      <Card className="border-evergreen/20 bg-evergreen/5">
        <p className="text-sm text-onyx-700 leading-relaxed">{analysis.summary}</p>
      </Card>

      {/* Strengths */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-evergreen" />
          <CardTitle>Points forts</CardTitle>
        </div>
        <ul className="space-y-2">
          {analysis.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-evergreen mt-1.5 shrink-0" />
              <span className="text-sm text-onyx-700">{s}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Weaknesses */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown size={16} className="text-mauve" />
          <CardTitle>Points à améliorer</CardTitle>
        </div>
        <ul className="space-y-2">
          {analysis.weaknesses.map((w, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-mauve mt-1.5 shrink-0" />
              <span className="text-sm text-onyx-700">{w}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Recommendations */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-lime-dark" />
          <CardTitle>Recommandations</CardTitle>
        </div>
        <ul className="space-y-2">
          {analysis.recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-xs font-bold text-lime-dark bg-lime/40 size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-sm text-onyx-700">{r}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Suggested exercises */}
      {suggestedExercises.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell size={16} className="text-blue-pp-dark" />
            <CardTitle>Exercices conseillés</CardTitle>
          </div>
          <div className="space-y-2">
            {suggestedExercises.map((ex) => ex && (
              <div key={ex.id} className="flex items-center gap-2 py-1.5 border-b border-onyx-50 last:border-0">
                <span className="text-sm text-onyx">{ex.name}</span>
                <Badge variant="outline" size="sm">{ex.duration_estimate}min</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
