'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import {
  Flame, Calendar, Star, Dumbbell, Clock, Trophy, Award,
  Medal, Crown, TrendingUp, Cpu, CheckCircle,
} from 'lucide-react'
import type { Badge as BadgeType, BadgeCategory } from '@/lib/types'
import { getBadges } from '@/lib/api'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

const ICON_MAP: Record<string, React.ElementType> = {
  Flame, Calendar, Star, Dumbbell, Clock, Trophy, Award,
  Medal, Crown, TrendingUp, Cpu, CheckCircle,
}

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  regularity: 'Régularité',
  volume: "Volume d'entraînement",
  matches: 'Matchs',
  progression: 'Progression',
}

const CATEGORIES: BadgeCategory[] = ['regularity', 'volume', 'matches', 'progression']

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBadges().then(b => { setBadges(b); setLoading(false) })
  }, [])

  if (loading) return <PageLoader />

  const unlocked = badges.filter(b => b.unlocked).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-onyx">Badges</h2>
          <p className="text-sm text-onyx-400">{unlocked}/{badges.length} débloqués</p>
        </div>
        <Badge variant="lime">{Math.round((unlocked / badges.length) * 100)}%</Badge>
      </div>

      {CATEGORIES.map(cat => {
        const catBadges = badges.filter(b => b.category === cat)
        if (!catBadges.length) return null
        return (
          <div key={cat}>
            <p className="text-xs font-semibold text-onyx-400 uppercase tracking-wide mb-2">{CATEGORY_LABELS[cat]}</p>
            <div className="space-y-2">
              {catBadges.map(badge => {
                const Icon = ICON_MAP[badge.icon] ?? Award
                return (
                  <Card key={badge.id} padding="sm" className={cn('flex items-center gap-3', !badge.unlocked && 'opacity-50')}>
                    <div className={cn(
                      'size-10 rounded-[8px] flex items-center justify-center shrink-0',
                      badge.unlocked ? 'bg-evergreen text-lime' : 'bg-onyx-100 text-onyx-400',
                    )}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-onyx">{badge.name}</p>
                        {badge.unlocked && <Badge variant="lime" size="sm">Débloqué</Badge>}
                      </div>
                      <p className="text-xs text-onyx-400 mt-0.5">{badge.description}</p>
                      {!badge.unlocked && badge.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-onyx-400">{badge.target_label}</span>
                            <span className="text-[10px] text-onyx-400">{badge.progress}%</span>
                          </div>
                          <ProgressBar value={badge.progress} size="sm" />
                        </div>
                      )}
                      {badge.unlocked && badge.unlocked_at && (
                        <p className="text-[10px] text-onyx-400 mt-0.5">Débloqué le {formatDate(badge.unlocked_at)}</p>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
