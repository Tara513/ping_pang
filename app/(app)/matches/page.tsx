'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Plus, Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import type { Match } from '@/lib/types'
import { getMatches } from '@/lib/api'
import { formatDateShort, formatMatchSetsResult } from '@/lib/utils/format'

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMatches().then(m => { setMatches(m); setLoading(false) })
  }, [])

  const wins = matches.filter(m => m.result === 'win').length
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-onyx">Matchs</h2>
          <p className="text-sm text-onyx-400">{matches.length} matchs · {winRate}% victoires</p>
        </div>
        <Link href="/matches/new">
          <Button variant="primary" icon={Plus} size="sm">Ajouter</Button>
        </Link>
      </div>

      {/* Win rate summary */}
      {matches.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Joués" value={matches.length} />
          <StatCard label="Victoires" value={wins} highlight="win" />
          <StatCard label="Win rate" value={`${winRate}%`} />
        </div>
      )}

      {matches.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Aucun match enregistré"
          description="Enregistre ton premier match pour suivre ta progression"
        />
      ) : (
        <div className="space-y-2">
          {matches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: string }) {
  return (
    <Card padding="sm" className="text-center">
      <p className={`font-heading font-bold text-xl ${highlight === 'win' ? 'text-evergreen' : 'text-onyx'}`}>{value}</p>
      <p className="text-xs text-onyx-400 mt-0.5">{label}</p>
    </Card>
  )
}

function MatchCard({ match }: { match: Match }) {
  const setsResult = formatMatchSetsResult(match)
  const isWin = match.result === 'win'

  return (
    <Link href={`/matches/${match.id}`}>
      <Card padding="sm" hover className="flex items-center gap-3">
        <div className={`size-10 rounded-[6px] flex items-center justify-center shrink-0 ${isWin ? 'bg-evergreen/10' : 'bg-mauve-light'}`}>
          {isWin
            ? <TrendingUp size={18} className="text-evergreen" />
            : <TrendingDown size={18} className="text-mauve" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-onyx truncate">vs {match.opponent_name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-onyx-400">{formatDateShort(match.date)}</span>
            {match.source === 'ranking' && <span className="text-[10px] font-semibold text-blue-pp-dark">PGR</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`font-heading font-bold text-base ${isWin ? 'text-evergreen' : 'text-mauve'}`}>
            {setsResult}
          </p>
          <p className="text-[10px] text-onyx-400">sets</p>
        </div>
      </Card>
    </Link>
  )
}
