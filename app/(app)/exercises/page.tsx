'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Search } from 'lucide-react'
import type { Exercise, ExerciseCategory } from '@/lib/types'
import { getExercises } from '@/lib/api'
import { EXERCISE_CATEGORY_LABELS } from '@/lib/utils/format'

const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  service: 'bg-evergreen/10 text-evergreen',
  return: 'bg-blue-pp/20 text-blue-pp-dark',
  topspin: 'bg-mauve-light text-mauve',
  block: 'bg-[#fff8e1] text-[#e65100]',
  footwork: 'bg-lime/40 text-lime-dark',
  regularity: 'bg-onyx-100 text-onyx-600',
  mental: 'bg-[#f3e8ff] text-[#7c3aed]',
  physical: 'bg-[#e8f5e9] text-[#2e7d32]',
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all')

  useEffect(() => {
    getExercises().then(e => { setExercises(e); setLoading(false) })
  }, [])

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'all' || ex.category === activeCategory
    return matchSearch && matchCat
  })

  const categories = Object.keys(EXERCISE_CATEGORY_LABELS) as ExerciseCategory[]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading font-bold text-xl text-onyx">Bibliothèque</h2>
        <p className="text-sm text-onyx-400">{exercises.length} exercices</p>
      </div>

      <Input
        icon={Search}
        placeholder="Rechercher un exercice..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Category filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        <FilterChip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>Tous</FilterChip>
        {categories.map(cat => (
          <FilterChip key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
            {EXERCISE_CATEGORY_LABELS[cat]}
          </FilterChip>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(ex => (
          <Link key={ex.id} href={`/exercises/${ex.id}`}>
            <Card padding="sm" hover className="flex items-center gap-3">
              <div className={`size-10 rounded-[6px] flex items-center justify-center shrink-0 text-lg ${CATEGORY_COLORS[ex.category]}`}>
                {'★'.repeat(ex.difficulty)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-onyx">{ex.name}</p>
                <p className="text-xs text-onyx-400 mt-0.5">
                  {EXERCISE_CATEGORY_LABELS[ex.category]} · {ex.duration_estimate}min
                </p>
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[ex.category]}`}>
                Niv.{ex.difficulty}
              </span>
            </Card>
          </Link>
        ))}
      </div>
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
