'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Plus, CheckCircle, Circle, Brain, ListTodo } from 'lucide-react'
import type { TrainingProgram } from '@/lib/types'
import { getPrograms } from '@/lib/api'
import { formatDate } from '@/lib/utils/format'
import { mockExercises } from '@/lib/mock-data'

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getPrograms().then(p => { setPrograms(p); setLoading(false) })
  }, [])

  if (loading) return <PageLoader />

  const active = programs.filter(p => p.status === 'active')
  const others = programs.filter(p => p.status !== 'active')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-onyx">Programmes</h2>
          <p className="text-sm text-onyx-400">{active.length} actif{active.length > 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" size="sm" icon={Plus}>Nouveau</Button>
      </div>

      {active.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-onyx-400 uppercase tracking-wide mb-2">En cours</p>
          <div className="space-y-3">
            {active.map(p => <ProgramCard key={p.id} program={p} expanded={expanded === p.id} onToggle={() => setExpanded(e => e === p.id ? null : p.id)} />)}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-onyx-400 uppercase tracking-wide mb-2">Archivés</p>
          <div className="space-y-3">
            {others.map(p => <ProgramCard key={p.id} program={p} expanded={expanded === p.id} onToggle={() => setExpanded(e => e === p.id ? null : p.id)} />)}
          </div>
        </div>
      )}

      {programs.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-4 text-center">
          <div className="size-14 rounded-full bg-onyx-50 flex items-center justify-center">
            <ListTodo size={24} className="text-onyx-400" />
          </div>
          <p className="font-heading font-bold text-base text-onyx">Aucun programme</p>
          <p className="text-sm text-onyx-400">Crée un programme ou laisse l'IA t'en recommander un après une analyse de match</p>
        </div>
      )}
    </div>
  )
}

function ProgramCard({ program: p, expanded, onToggle }: { program: TrainingProgram; expanded: boolean; onToggle: () => void }) {
  const completedSessions = p.sessions.filter(s => s.completed).length

  return (
    <Card>
      <CardHeader>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <CardTitle>{p.name}</CardTitle>
            {p.ai_generated && <Badge variant="lime" size="sm"><Brain size={10} className="mr-0.5" />IA</Badge>}
          </div>
          <p className="text-xs text-onyx-400">{completedSessions}/{p.sessions.length} séances</p>
        </div>
        <Badge variant={p.status === 'active' ? 'success' : p.status === 'completed' ? 'outline' : 'default'}>
          {p.status === 'active' ? 'Actif' : p.status === 'completed' ? 'Terminé' : 'Archivé'}
        </Badge>
      </CardHeader>

      <ProgressBar value={p.progress} className="mb-3" showLabel />

      <p className="text-sm text-onyx-600 mb-3 line-clamp-2">{p.description}</p>

      {expanded && (
        <div className="space-y-2 mb-3">
          {p.sessions.map(session => {
            const exercises = session.exercise_ids.map(id => mockExercises.find(e => e.id === id)?.name).filter(Boolean)
            return (
              <div key={session.id} className="flex items-start gap-2.5 py-1.5 border-b border-onyx-50 last:border-0">
                {session.completed
                  ? <CheckCircle size={16} className="text-evergreen shrink-0 mt-0.5" />
                  : <Circle size={16} className="text-onyx-300 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-sm font-medium ${session.completed ? 'text-onyx-400 line-through' : 'text-onyx'}`}>
                    {session.name}
                  </p>
                  <p className="text-xs text-onyx-400">{exercises.join(', ')}</p>
                  {session.scheduled_date && (
                    <p className="text-[10px] text-onyx-400 mt-0.5">{formatDate(session.scheduled_date)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button onClick={onToggle} className="text-xs text-onyx-400 hover:text-onyx font-medium">
        {expanded ? 'Réduire' : 'Voir les séances'}
      </button>
    </Card>
  )
}
