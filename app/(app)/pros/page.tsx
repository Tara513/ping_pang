'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Star, Clock, Dumbbell, Play } from 'lucide-react'
import type { ProRoutine } from '@/lib/types'
import { getProRoutines } from '@/lib/api'
import { mockExercises } from '@/lib/mock-data'
import { cn } from '@/lib/utils/cn'

export default function ProsPage() {
  const [routines, setRoutines] = useState<ProRoutine[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    getProRoutines().then(r => { setRoutines(r); setLoading(false) })
  }, [])

  if (loading) return <PageLoader />

  const active = routines.find(r => r.id === selected)

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-xl text-onyx">Routines de pros</h2>

      {/* Player list */}
      {!selected && (
        <div className="space-y-2">
          {routines.map(r => (
            <Card key={r.id} padding="sm" hover onClick={() => setSelected(r.id)} className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-evergreen flex items-center justify-center shrink-0">
                <span className="font-heading font-bold text-lime text-sm">
                  {r.player_name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm text-onyx">{r.player_name}</p>
                  {r.player_rank && <Badge variant="lime" size="sm">#{r.player_rank} mondial</Badge>}
                </div>
                <p className="text-xs text-onyx-400">{r.player_country} · {r.training_hours_per_week}h/semaine</p>
              </div>
              <Star size={14} className="text-onyx-200 shrink-0" />
            </Card>
          ))}
        </div>
      )}

      {/* Detail */}
      {selected && active && (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="text-sm text-onyx-400 hover:text-onyx">
            ← Retour
          </button>

          <div className="flex items-center gap-3">
            <div className="size-14 rounded-full bg-evergreen flex items-center justify-center">
              <span className="font-heading font-bold text-lime text-lg">
                {active.player_name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-xl text-onyx">{active.player_name}</h3>
                {active.player_rank && <Badge variant="lime">#{active.player_rank}</Badge>}
              </div>
              <p className="text-sm text-onyx-400">{active.player_country}</p>
            </div>
          </div>

          <p className="text-sm text-onyx-700 leading-relaxed">{active.description}</p>

          {/* Stats */}
          <div className="flex gap-3">
            <Card padding="sm" className="flex-1 text-center">
              <Clock size={16} className="text-onyx-400 mx-auto mb-1" />
              <p className="font-heading font-bold text-lg text-onyx">{active.training_hours_per_week}h</p>
              <p className="text-[10px] text-onyx-400">par semaine</p>
            </Card>
          </div>

          {/* Equipment */}
          <Card>
            <CardTitle className="mb-3">Matériel</CardTitle>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Bois', value: active.equipment.blade },
                { label: 'Coup droit', value: active.equipment.forehand_rubber },
                { label: 'Revers', value: active.equipment.backhand_rubber },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-1 border-b border-onyx-50 last:border-0">
                  <span className="text-onyx-400">{item.label}</span>
                  <span className="font-medium text-onyx text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Favorite exercises */}
          <Card>
            <CardTitle className="mb-3">Exercices favoris</CardTitle>
            <div className="space-y-2">
              {active.favorite_exercise_ids.map(id => {
                const ex = mockExercises.find(e => e.id === id)
                if (!ex) return null
                return (
                  <div key={id} className="flex items-center gap-2 py-1 border-b border-onyx-50 last:border-0">
                    <Dumbbell size={13} className="text-evergreen shrink-0" />
                    <span className="text-sm text-onyx">{ex.name}</span>
                    <Badge variant="outline" size="sm">{ex.duration_estimate}min</Badge>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Tips */}
          <Card>
            <CardTitle className="mb-3">Conseils</CardTitle>
            <div className="space-y-3">
              {active.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs font-bold text-lime-dark bg-lime/40 size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-onyx-700 italic">"{tip}"</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Video */}
          {active.video_label && (
            <Card className="border-dashed flex items-center gap-3">
              <div className="size-10 rounded-[6px] bg-onyx-100 flex items-center justify-center shrink-0">
                <Play size={18} className="text-onyx-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-onyx">{active.video_label}</p>
                <p className="text-xs text-onyx-400">Contenu vidéo · Bientôt disponible</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
