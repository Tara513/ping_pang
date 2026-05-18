'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Brain, RefreshCw, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import type { AIReport } from '@/lib/types'
import { getAIReports, generateWeeklyReport } from '@/lib/api'
import { formatDate } from '@/lib/utils/format'

export default function AIReportsPage() {
  const [reports, setReports] = useState<AIReport[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getAIReports().then(r => { setReports(r); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const generate = async () => {
    setGenerating(true)
    try {
      const r = await generateWeeklyReport()
      setReports(prev => [r, ...prev])
    } catch {
      // silent fail — spinner stops, user can retry
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-onyx">Bilans IA</h2>
          <p className="text-sm text-onyx-400">{reports.length} rapport{reports.length > 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" size="sm" icon={Brain} loading={generating} onClick={generate}>
          Bilan semaine
        </Button>
      </div>

      {generating && (
        <Card className="flex items-center gap-3">
          <LoadingSpinner size="sm" />
          <div>
            <p className="text-sm font-medium text-onyx">Génération en cours…</p>
            <p className="text-xs text-onyx-400">L&apos;IA analyse ta semaine</p>
          </div>
        </Card>
      )}

      {reports.length === 0 && !generating ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="size-14 rounded-full bg-evergreen/10 flex items-center justify-center">
            <Brain size={24} className="text-evergreen" />
          </div>
          <p className="font-heading font-bold text-base text-onyx">Aucun bilan généré</p>
          <p className="text-sm text-onyx-400 max-w-[240px]">
            Génère ton premier bilan hebdomadaire pour voir ta progression analysée par l&apos;IA
          </p>
          <Button variant="primary" icon={Brain} onClick={generate}>Générer un bilan</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReportCard({ report }: { report: AIReport }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={report.type === 'weekly' ? 'lime' : 'blue'}>
              {report.type === 'weekly' ? 'Bilan semaine' : 'Bilan saison'}
            </Badge>
          </div>
          <p className="text-xs text-onyx-400 flex items-center gap-1">
            <Calendar size={11} />
            {formatDate(report.period_start)} — {formatDate(report.period_end)}
          </p>
        </div>
        <p className="text-[10px] text-onyx-400">{formatDate(report.generated_at)}</p>
      </div>

      <p className="text-sm text-onyx-700 leading-relaxed mb-3">{report.summary}</p>

      {expanded && (
        <>
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-evergreen" />
              <p className="text-xs font-semibold text-evergreen uppercase tracking-wide">Points positifs</p>
            </div>
            <ul className="space-y-1.5">
              {report.positives.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-evergreen mt-1.5 shrink-0" />
                  <span className="text-sm text-onyx-700">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={14} className="text-mauve" />
              <p className="text-xs font-semibold text-mauve uppercase tracking-wide">Axes d&apos;amélioration</p>
            </div>
            <ul className="space-y-1.5">
              {report.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-mauve mt-1.5 shrink-0" />
                  <span className="text-sm text-onyx-700">{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <button
        onClick={() => setExpanded(e => !e)}
        className="mt-3 text-xs text-onyx-400 hover:text-onyx font-medium"
      >
        {expanded ? 'Réduire' : 'Voir le détail'}
      </button>
    </Card>
  )
}
