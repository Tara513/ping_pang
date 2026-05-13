'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Plus, Dumbbell, Filter } from 'lucide-react'
import type { TrainingSession, SessionType } from '@/lib/types'
import { getSessions } from '@/lib/api'
import { formatDateShort, formatDuration, FEELING_EMOJIS, SESSION_TYPE_LABELS } from '@/lib/utils/format'

const ALL_TYPES: SessionType[] = ['solo', 'multi-balls', 'partner', 'match-training', 'physical', 'mental']

const TYPE_COLORS: Record<SessionType, string> = {
  solo: 'bg-onyx-100 text-onyx-600',
  'multi-balls': 'bg-blue-pp/20 text-blue-pp-dark',
  partner: 'bg-evergreen/10 text-evergreen',
  'match-training': 'bg-mauve-light text-mauve',
  physical: 'bg-lime/40 text-lime-dark',
  mental: 'bg-[#f3e8ff] text-[#7c3aed]',
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<SessionType | 'all'>('all')

  useEffect(() => {
    getSessions().then(s => { setSessions(s); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.type === filter)

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-onyx">Séances</h2>
          <p className="text-sm text-onyx-400">{sessions.length} enregistrées</p>
        </div>
        <Link href="/sessions/new">
          <Button variant="primary" icon={Plus} size="sm">Nouvelle</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>Toutes</FilterChip>
        {ALL_TYPES.map(t => (
          <FilterChip key={t} active={filter === t} onClick={() => setFilter(t)}>
            {SESSION_TYPE_LABELS[t]}
          </FilterChip>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Aucune séance"
          description="Enregistre ta première séance d'entraînement"
          action={{ label: 'Nouvelle séance', href: '/sessions/new' } as never}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(session => (
            <SessionCard key={session.id} session={session} typeColors={TYPE_COLORS} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-evergreen text-pp-white' : 'bg-white border border-onyx-200 text-onyx-600 hover:border-onyx-400'
      }`}
    >
      {children}
    </button>
  )
}

function SessionCard({ session, typeColors }: { session: TrainingSession; typeColors: Record<string, string> }) {
  return (
    <Link href={`/sessions/${session.id}`}>
      <Card padding="sm" hover className="flex items-start gap-3">
        <div className="size-10 rounded-[6px] bg-evergreen/10 flex items-center justify-center shrink-0">
          <Dumbbell size={18} className="text-evergreen" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeColors[session.type]}`}>
              {SESSION_TYPE_LABELS[session.type]}
            </span>
            {session.coach_comment && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-lime/40 text-lime-dark">Coach</span>
            )}
          </div>
          <p className="text-sm font-medium text-onyx">{formatDateShort(session.date)}</p>
          <p className="text-xs text-onyx-400 mt-0.5">
            {formatDuration(session.duration)}
            {session.location && ` · ${session.location}`}
            {` · ${session.exercises.length} exercice${session.exercises.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-lg">{FEELING_EMOJIS[session.feeling]}</span>
          <p className="text-[10px] text-onyx-400 mt-0.5">Ressenti</p>
        </div>
      </Card>
    </Link>
  )
}
