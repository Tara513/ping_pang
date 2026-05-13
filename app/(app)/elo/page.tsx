'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { EloRating, Federation } from '@/lib/types'
import { getEloRatings } from '@/lib/api'
import { formatElo, FEDERATION_LABELS } from '@/lib/utils/format'
import { formatDate } from '@/lib/utils/format'

const CONFIDENCE_BADGES: Record<string, string> = {
  high: 'success',
  medium: 'warning',
  low: 'danger',
}
const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'Fiabilité haute',
  medium: 'Fiabilité moyenne',
  low: 'Fiabilité faible',
}

export default function EloPage() {
  const [ratings, setRatings] = useState<EloRating[]>([])
  const [active, setActive] = useState<Federation>('FFTT')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEloRatings().then(r => { setRatings(r); setLoading(false) })
  }, [])

  const activeRating = ratings.find(r => r.federation === active)
  const federations = ratings.map(r => r.federation)

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-xl text-onyx">Classement ELO</h2>

      {/* Federation switcher */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {federations.map(fed => (
          <button
            key={fed}
            onClick={() => setActive(fed)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              active === fed ? 'bg-evergreen text-pp-white' : 'bg-white border border-onyx-200 text-onyx-600 hover:border-onyx-400'
            }`}
          >
            {fed}
          </button>
        ))}
      </div>

      {activeRating && (
        <>
          {/* Main rating card */}
          <Card className="border-evergreen/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-onyx-400 mb-1">{FEDERATION_LABELS[active]}</p>
                <p className="font-heading font-black text-5xl text-onyx">{formatElo(activeRating.rating)}</p>
              </div>
              <Badge variant={CONFIDENCE_BADGES[activeRating.confidence] as 'success' | 'warning' | 'danger'}>
                {CONFIDENCE_LABELS[activeRating.confidence]}
              </Badge>
            </div>
            {activeRating.percentile && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-onyx-100 rounded-full overflow-hidden">
                  <div className="h-full bg-lime-dark rounded-full" style={{ width: `${activeRating.percentile}%` }} />
                </div>
                <span className="text-xs font-semibold text-onyx-600">Top {100 - activeRating.percentile}%</span>
              </div>
            )}
            <p className="text-xs text-onyx-400 mt-2">Dernière MàJ : {formatDate(activeRating.last_updated, 'd MMM yyyy')}</p>
          </Card>

          {/* ELO history chart */}
          <Card>
            <CardTitle className="mb-4">Évolution</CardTitle>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={activeRating.history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#888' }}
                  tickFormatter={v => formatDate(v, 'MMM')}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e8e8e8' }}
                  formatter={(v) => [formatElo(Number(v)), 'ELO']}
                  labelFormatter={(l) => formatDate(l, 'd MMM yyyy')}
                />
                <Line type="monotone" dataKey="rating" stroke="#092C25" strokeWidth={2.5} dot={{ r: 3, fill: '#092C25' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* History list */}
          <Card>
            <CardTitle className="mb-3">Historique des matchs</CardTitle>
            <div className="space-y-2">
              {[...activeRating.history].reverse().map((point, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-onyx-50 last:border-0">
                  <p className="text-sm text-onyx-600">{formatDate(point.date, 'd MMM yyyy')}</p>
                  <div className="flex items-center gap-2">
                    {point.delta !== undefined && (
                      <span className={`flex items-center gap-0.5 text-xs font-semibold ${point.delta >= 0 ? 'text-evergreen' : 'text-mauve'}`}>
                        {point.delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {point.delta >= 0 ? '+' : ''}{point.delta}
                      </span>
                    )}
                    <span className="font-heading font-bold text-sm text-onyx tabular-nums">{formatElo(point.rating)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
