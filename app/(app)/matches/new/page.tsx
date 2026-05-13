'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Check, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { MatchType, Level, SetScore } from '@/lib/types'
import { createMatch } from '@/lib/api'
import { LEVEL_LABELS } from '@/lib/utils/format'

const MATCH_TYPES: { value: MatchType; label: string }[] = [
  { value: 'friendly', label: 'Amical' },
  { value: 'tournament', label: 'Tournoi' },
  { value: 'ranking', label: 'Classement' },
  { value: 'training', label: 'Entraînement' },
]

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced', 'expert', 'pro']

const emptySet = (): SetScore => ({ player: 0, opponent: 0 })

export default function NewMatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    opponent_name: '',
    opponent_level: '' as Level | '',
    match_type: 'friendly' as MatchType,
    date: new Date().toISOString().split('T')[0],
    location: '',
    sets: [emptySet()],
  })

  const addSet = () => setForm(f => ({ ...f, sets: [...f.sets, emptySet()] }))
  const removeSet = (i: number) => setForm(f => ({ ...f, sets: f.sets.filter((_, idx) => idx !== i) }))
  const updateSet = (i: number, key: 'player' | 'opponent', val: number) => {
    setForm(f => {
      const sets = [...f.sets]
      sets[i] = { ...sets[i], [key]: val }
      return { ...f, sets }
    })
  }

  const calcResult = () => {
    const playerSets = form.sets.filter(s => s.player > s.opponent).length
    const opponentSets = form.sets.filter(s => s.opponent > s.player).length
    return playerSets > opponentSets ? 'win' : 'loss'
  }

  const submit = async () => {
    if (!form.opponent_name || !form.sets.length) return
    setLoading(true)
    await createMatch({
      user_id: 'user-1',
      opponent_name: form.opponent_name,
      opponent_level: (form.opponent_level || undefined) as Level | undefined,
      match_type: form.match_type,
      date: form.date,
      location: form.location || undefined,
      sets: form.sets,
      result: calcResult(),
      source: 'manual',
    })
    router.push('/matches')
  }

  const result = calcResult()

  return (
    <div className="space-y-5">
      <h2 className="font-heading font-bold text-xl text-onyx">Nouveau match</h2>

      <Input
        label="Adversaire"
        value={form.opponent_name}
        onChange={e => setForm(f => ({ ...f, opponent_name: e.target.value }))}
        placeholder="Nom de l'adversaire"
      />

      <Select
        label="Niveau adversaire (optionnel)"
        value={form.opponent_level}
        onChange={e => setForm(f => ({ ...f, opponent_level: e.target.value as Level }))}
        placeholder="Sélectionner..."
        options={LEVELS.map(l => ({ value: l, label: LEVEL_LABELS[l] }))}
      />

      {/* Type */}
      <div>
        <p className="text-sm font-medium text-onyx-600 mb-2">Type de match</p>
        <div className="grid grid-cols-2 gap-2">
          {MATCH_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setForm(f => ({ ...f, match_type: t.value }))}
              className={cn(
                'py-2.5 rounded-[8px] border text-sm font-medium transition-all',
                form.match_type === t.value
                  ? 'border-evergreen bg-evergreen text-pp-white'
                  : 'border-onyx-200 bg-white hover:border-onyx-400',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Input type="date" label="Date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
      <Input label="Lieu (optionnel)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Salle..." />

      {/* Sets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-onyx-600">Score set par set</p>
          <Button variant="ghost" size="sm" icon={Plus} onClick={addSet}>Set</Button>
        </div>
        <div className="space-y-2">
          {form.sets.map((set, i) => (
            <Card key={i} padding="sm" className="flex items-center gap-3">
              <span className="text-xs text-onyx-400 w-10 shrink-0">Set {i + 1}</span>
              <div className="flex-1 flex items-center gap-2">
                <SetInput value={set.player} onChange={v => updateSet(i, 'player', v)} label="Toi" />
                <span className="text-onyx-400 font-bold">–</span>
                <SetInput value={set.opponent} onChange={v => updateSet(i, 'opponent', v)} label="Adv." />
              </div>
              {form.sets.length > 1 && (
                <button onClick={() => removeSet(i)} className="text-onyx-300 hover:text-mauve">
                  <Minus size={16} />
                </button>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Result preview */}
      {form.sets.some(s => s.player > 0 || s.opponent > 0) && (
        <Card className={cn('text-center', result === 'win' ? 'border-evergreen/30 bg-evergreen/5' : 'border-mauve/30 bg-mauve-light')}>
          <p className={`font-heading font-bold text-2xl ${result === 'win' ? 'text-evergreen' : 'text-mauve'}`}>
            {result === 'win' ? 'Victoire' : 'Défaite'}
          </p>
          <p className="text-sm text-onyx-400 mt-0.5">
            {form.sets.filter(s => s.player > s.opponent).length} /&nbsp;
            {form.sets.filter(s => s.opponent > s.player).length} sets
          </p>
        </Card>
      )}

      <Button variant="primary" icon={Check} fullWidth loading={loading} onClick={submit}>
        Enregistrer le match
      </Button>
    </div>
  )
}

function SetInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-[10px] text-onyx-400 mb-1">{label}</p>
      <input
        type="number"
        min={0}
        max={30}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-10 text-center font-heading font-bold text-lg border border-onyx-200 rounded-[8px] focus:outline-none focus:border-evergreen"
      />
    </div>
  )
}
