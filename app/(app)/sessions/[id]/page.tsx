'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Dumbbell, MapPin, Clock, MessageSquare } from 'lucide-react'
import type { TrainingSession } from '@/lib/types'
import { getSession } from '@/lib/api'
import {
  formatDate, formatDuration, FEELING_EMOJIS,
  SESSION_TYPE_LABELS, EXERCISE_CATEGORY_LABELS,
} from '@/lib/utils/format'

export default function SessionDetailPage() {
  const { id } = useParams()
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession(id as string).then(s => { setSession(s); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!session) return <div className="text-center py-16 text-onyx-400">Séance introuvable</div>

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Badge variant="outline" className="mb-2">{SESSION_TYPE_LABELS[session.type]}</Badge>
          <h2 className="font-heading font-bold text-xl text-onyx">{formatDate(session.date)}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-onyx-400">
            <span className="flex items-center gap-1"><Clock size={13} />{formatDuration(session.duration)}</span>
            {session.location && <span className="flex items-center gap-1"><MapPin size={13} />{session.location}</span>}
          </div>
        </div>
        <div className="text-4xl">{FEELING_EMOJIS[session.feeling]}</div>
      </div>

      {/* Metrics */}
      <Card>
        <CardTitle className="mb-4">Paramètres de séance</CardTitle>
        <div className="space-y-3">
          <MetricRow label="Fatigue" value={session.fatigue} variant="red" />
          <MetricRow label="Motivation" value={session.motivation} variant="blue" />
          <MetricRow label="Confiance" value={session.confidence} variant="lime" />
        </div>
      </Card>

      {/* Exercises */}
      {session.exercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exercices</CardTitle>
            <span className="text-sm text-onyx-400">{session.exercises.length}</span>
          </CardHeader>
          <div className="space-y-3">
            {session.exercises.map((se, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-onyx-50 last:border-0">
                <div className="size-8 rounded-[6px] bg-evergreen/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Dumbbell size={14} className="text-evergreen" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-onyx">{se.exercise.name}</p>
                  <p className="text-xs text-onyx-400 mt-0.5">
                    {EXERCISE_CATEGORY_LABELS[se.exercise.category]} · {formatDuration(se.duration)}
                  </p>
                  {se.notes && <p className="text-xs text-onyx-600 mt-1 italic">{se.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notes */}
      {session.notes && (
        <Card>
          <CardTitle className="mb-2">Notes</CardTitle>
          <p className="text-sm text-onyx-600 leading-relaxed">{session.notes}</p>
        </Card>
      )}

      {/* Coach comment */}
      {session.coach_comment && (
        <Card className="border-lime/40 bg-lime/10">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-evergreen flex items-center justify-center shrink-0">
              <MessageSquare size={14} className="text-lime" />
            </div>
            <div>
              <p className="text-xs font-semibold text-evergreen mb-1">Commentaire coach</p>
              <p className="text-sm text-onyx-700 leading-relaxed">{session.coach_comment}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function MetricRow({ label, value, variant }: { label: string; value: number; variant: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-onyx-600">{label}</span>
        <span className="text-xs font-semibold text-onyx tabular-nums">{value}/5</span>
      </div>
      <ProgressBar value={value * 20} variant={variant as 'red' | 'blue' | 'lime'} size="sm" />
    </div>
  )
}
