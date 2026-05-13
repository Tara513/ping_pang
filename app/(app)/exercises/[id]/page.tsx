'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Plus, Clock, Target, Users } from 'lucide-react'
import type { Exercise } from '@/lib/types'
import { getExercise } from '@/lib/api'
import { EXERCISE_CATEGORY_LABELS, LEVEL_LABELS } from '@/lib/utils/format'

export default function ExerciseDetailPage() {
  const { id } = useParams()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExercise(id as string).then(e => { setExercise(e); setLoading(false) })
  }, [id])

  if (loading) return <PageLoader />
  if (!exercise) return <div className="text-center py-16 text-onyx-400">Exercice introuvable</div>

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Badge variant="outline" className="mb-2">{EXERCISE_CATEGORY_LABELS[exercise.category]}</Badge>
        <h2 className="font-heading font-bold text-2xl text-onyx mb-2">{exercise.name}</h2>
        <div className="flex items-center gap-4 text-sm text-onyx-400">
          <span className="flex items-center gap-1"><Clock size={13} />{exercise.duration_estimate}min</span>
          <span>Difficulté : {'★'.repeat(exercise.difficulty)}{'☆'.repeat(5 - exercise.difficulty)}</span>
        </div>
      </div>

      {/* Objective */}
      <Card className="border-evergreen/30 bg-evergreen/5">
        <div className="flex items-start gap-3">
          <Target size={18} className="text-evergreen shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-evergreen mb-1">Objectif</p>
            <p className="text-sm text-onyx-700">{exercise.objective}</p>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card>
        <CardTitle className="mb-2">Description</CardTitle>
        <p className="text-sm text-onyx-600 leading-relaxed">{exercise.description}</p>
      </Card>

      {/* Levels */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-onyx-400" />
          <CardTitle>Niveaux recommandés</CardTitle>
        </div>
        <div className="flex gap-2 flex-wrap">
          {exercise.recommended_levels.map(level => (
            <Badge key={level} variant="outline">{LEVEL_LABELS[level]}</Badge>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <Button variant="primary" icon={Plus} fullWidth>
        Ajouter à une séance
      </Button>
    </div>
  )
}
