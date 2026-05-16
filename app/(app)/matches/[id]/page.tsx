'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Brain, MapPin, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import type { Match } from '@/lib/types'
import { getMatch } from '@/lib/api'
import { formatDate, formatMatchSetsResult } from '@/lib/utils/format'

export default function MatchDetailPage() {
  const { id } = useParams()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMatch(id as string).then(m => { setMatch(m); setLoading(false) })
  }, [id])

  if (loading) return <PageLoader />
  if (!match) return <div className="text-center py-16 text-onyx-400">Match introuvable</div>

  const isWin = match.result === 'win'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`rounded-[8px] p-5 ${isWin ? 'bg-evergreen text-pp-white' : 'bg-onyx text-pp-white'}`}>
        <div className="flex items-center gap-2 mb-1">
          {isWin
            ? <TrendingUp size={16} className="text-lime" />
            : <TrendingDown size={16} className="text-mauve" />}
          <span className={`text-sm font-semibold ${isWin ? 'text-lime' : 'text-mauve'}`}>
            {isWin ? 'Victoire' : 'Défaite'}
          </span>
          {match.source === 'ranking' && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-blue-pp bg-white/90 px-1.5 py-0.5 rounded-[4px]">
              PGR
            </span>
          )}
        </div>
        <h2 className="font-heading font-bold text-2xl mb-0.5">vs {match.opponent_name}</h2>
        <div className="flex items-center gap-4 mt-3 text-sm opacity-70">
          <span className="flex items-center gap-1"><Calendar size={13} />{formatDate(match.date)}</span>
          {match.location && <span className="flex items-center gap-1"><MapPin size={13} />{match.location}</span>}
        </div>
      </div>

      {/* Score */}
      <Card>
        <CardTitle className="mb-4">Score</CardTitle>
        {match.sets.length > 0 ? (
          <div className="space-y-2">
            {match.sets.map((set, i) => {
              const playerWon = set.player > set.opponent
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-onyx-400 w-10">Set {i + 1}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className={`flex-1 text-center py-2 rounded-[6px] font-heading font-bold text-lg ${playerWon ? 'bg-evergreen text-pp-white' : 'bg-onyx-50 text-onyx-600'}`}>
                      {set.player}
                    </div>
                    <span className="text-onyx-300 text-sm">–</span>
                    <div className={`flex-1 text-center py-2 rounded-[6px] font-heading font-bold text-lg ${!playerWon ? 'bg-onyx text-pp-white' : 'bg-onyx-50 text-onyx-600'}`}>
                      {set.opponent}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-onyx-400">Détail des sets non disponible.</p>
        )}
        <div className="mt-3 pt-3 border-t border-onyx-100 flex justify-between items-center">
          <span className="text-sm text-onyx-400">Résultat sets</span>
          <span className="font-heading font-bold text-lg text-onyx">{formatMatchSetsResult(match)}</span>
        </div>
      </Card>

      {/* Analysis CTA */}
      <Link href={`/matches/${match.id}/analysis`}>
        <Card className="flex items-center gap-3 cursor-pointer hover:border-evergreen transition-colors">
          <div className="size-10 rounded-[6px] bg-evergreen/10 flex items-center justify-center shrink-0">
            <Brain size={18} className="text-evergreen" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-onyx">
              Analyser avec l&apos;IA
            </p>
            <p className="text-xs text-onyx-400">
              Générer une analyse détaillée
            </p>
          </div>
          <Button variant="primary" size="sm">Analyser</Button>
        </Card>
      </Link>
    </div>
  )
}
