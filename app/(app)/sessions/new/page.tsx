'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Slider } from '@/components/ui/Slider'
import { Check, Plus, Book } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { mockExercises } from '@/lib/mock-data'
import { createTrainingSession } from '@/lib/actions/training'
import { SESSION_TYPE_LABELS, EXERCISE_CATEGORY_LABELS, FEELING_EMOJIS } from '@/lib/utils/format'

type TrainingSessionType = 'technique' | 'physique' | 'match' | 'service' | 'competition' | 'chill'

const SESSION_TYPES: TrainingSessionType[] = ['technique', 'service', 'match', 'physique', 'competition', 'chill']

export default function NewSessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'main' | 'exercises' | 'feeling'>('main')

  const [form, setForm] = useState({
    type: 'technique' as TrainingSessionType,
    date: new Date().toISOString().split('T')[0],
    duration: 90,
    location: 'Racing Club de France',
    notes: '',
    feeling: 4 as 1 | 2 | 3 | 4 | 5,
    fatigue: 50,
    motivation: 75,
    confidence: 70,
    selectedExercises: [] as string[],
  })

  const toggleExercise = (id: string) => {
    setForm(f => ({
      ...f,
      selectedExercises: f.selectedExercises.includes(id)
        ? f.selectedExercises.filter(e => e !== id)
        : [...f.selectedExercises, id],
    }))
  }

  const submit = async () => {
    setLoading(true)
    const exercises = form.selectedExercises.map(id => {
      const ex = mockExercises.find(e => e.id === id)
      if (!ex) return null
      return { name: ex.name, notes: ex.objective }
    }).filter((ex): ex is { name: string; notes: string } => ex !== null)
    const toRating = (value: number) => Math.max(1, Math.min(5, Math.round(value / 25) + 1))
    const result = await createTrainingSession({
      date: form.date,
      duration_min: form.duration,
      session_type: form.type,
      location: form.location || null,
      exercises,
      notes: form.notes || null,
      feeling: form.feeling,
      fatigue: toRating(form.fatigue),
      motivation: toRating(form.motivation),
      confidence: toRating(form.confidence),
      has_description: true,
    })
    setLoading(false)
    if (!result.ok) return
    router.push('/sessions')
  }

  if (step === 'exercises') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-onyx">Exercices</h2>
          <Button variant="primary" size="sm" icon={Check} onClick={() => setStep('feeling')}>
            OK ({form.selectedExercises.length})
          </Button>
        </div>
        <div className="space-y-3">
          {Object.entries(EXERCISE_CATEGORY_LABELS).map(([cat, catLabel]) => {
            const catExercises = mockExercises.filter(e => e.category === cat)
            if (!catExercises.length) return null
            return (
              <div key={cat}>
                <p className="text-xs font-semibold text-onyx-400 uppercase tracking-wide mb-2">{catLabel}</p>
                <div className="space-y-1.5">
                  {catExercises.map(ex => {
                    const selected = form.selectedExercises.includes(ex.id)
                    return (
                      <button
                        key={ex.id}
                        onClick={() => toggleExercise(ex.id)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 rounded-[8px] border transition-all flex items-center gap-3',
                          selected ? 'border-evergreen bg-evergreen/5' : 'border-onyx-100 bg-white hover:border-onyx-300',
                        )}
                      >
                        <div className={cn(
                          'size-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
                          selected ? 'border-evergreen bg-evergreen' : 'border-onyx-300',
                        )}>
                          {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-onyx">{ex.name}</p>
                          <p className="text-xs text-onyx-400">{ex.duration_estimate}min · {'★'.repeat(ex.difficulty)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (step === 'feeling') {
    return (
      <div className="space-y-5">
        <h2 className="font-heading font-bold text-xl text-onyx">Ressenti</h2>

        {/* Feeling emoji */}
        <Card>
          <CardTitle className="mb-4">Comment tu te sens ?</CardTitle>
          <div className="flex justify-between">
            {([1, 2, 3, 4, 5] as const).map(f => (
              <button
                key={f}
                onClick={() => setForm(p => ({ ...p, feeling: f }))}
                className={cn(
                  'flex-1 py-3 text-2xl rounded-[8px] border-2 transition-all',
                  form.feeling === f ? 'border-evergreen bg-evergreen/5 scale-105' : 'border-transparent hover:border-onyx-200',
                )}
              >
                {FEELING_EMOJIS[f]}
              </button>
            ))}
          </div>
        </Card>

        {/* Sliders */}
        <Card>
          <CardTitle className="mb-4">Paramètres</CardTitle>
          <div className="space-y-5">
            <Slider label="Fatigue" value={form.fatigue} onChange={v => setForm(p => ({ ...p, fatigue: v }))} />
            <Slider label="Motivation" value={form.motivation} onChange={v => setForm(p => ({ ...p, motivation: v }))} />
            <Slider label="Confiance" value={form.confidence} onChange={v => setForm(p => ({ ...p, confidence: v }))} />
          </div>
        </Card>

        {/* Notes */}
        <Textarea
          label="Notes personnelles"
          placeholder="Observations, points à travailler..."
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          rows={3}
        />

        <Button variant="primary" icon={Check} fullWidth loading={loading} onClick={submit}>
          Enregistrer la séance
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="font-heading font-bold text-xl text-onyx">Nouvelle séance</h2>

      {/* Type */}
      <div>
        <p className="text-sm font-medium text-onyx-600 mb-2">Type de séance</p>
        <div className="grid grid-cols-2 gap-2">
          {SESSION_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setForm(p => ({ ...p, type: t }))}
              className={cn(
                'px-3 py-2.5 rounded-[8px] border text-sm font-medium text-left transition-all',
                form.type === t ? 'border-evergreen bg-evergreen text-pp-white' : 'border-onyx-200 bg-white hover:border-onyx-400',
              )}
            >
              {SESSION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <Input
        type="date"
        label="Date"
        value={form.date}
        onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
      />

      <div>
        <label className="text-sm font-medium text-onyx-600 block mb-1.5">Durée</label>
        <div className="flex items-center gap-3">
          {[30, 45, 60, 90, 120].map(d => (
            <button
              key={d}
              onClick={() => setForm(p => ({ ...p, duration: d }))}
              className={cn(
                'flex-1 py-2 rounded-[8px] border text-xs font-semibold transition-all',
                form.duration === d ? 'border-evergreen bg-evergreen text-pp-white' : 'border-onyx-200 bg-white hover:border-onyx-400',
              )}
            >
              {d < 60 ? `${d}min` : `${d / 60}h`}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Lieu (optionnel)"
        value={form.location}
        onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
        placeholder="Racing Club de France"
      />

      {/* Exercises summary */}
      <Card padding="sm" className="flex items-center justify-between cursor-pointer" onClick={() => setStep('exercises')}>
        <div className="flex items-center gap-2">
          <Book size={16} className="text-onyx-400" />
          <span className="text-sm font-medium text-onyx">Exercices</span>
          {form.selectedExercises.length > 0 && (
            <span className="text-xs text-onyx-400">({form.selectedExercises.length} sélectionné{form.selectedExercises.length > 1 ? 's' : ''})</span>
          )}
        </div>
        <Plus size={16} className="text-onyx-400" />
      </Card>

      <Button variant="primary" fullWidth onClick={() => setStep('feeling')}>
        Continuer
      </Button>
    </div>
  )
}
