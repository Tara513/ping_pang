'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Users, Dumbbell, Trophy, UserPlus } from 'lucide-react'
import type { FollowActivity } from '@/lib/types'
import { getFollowActivities } from '@/lib/api'
import { formatDateShort, LEVEL_LABELS } from '@/lib/utils/format'
import { mockFollowedUsers } from '@/lib/mock-data'

export default function SocialPage() {
  const [activities, setActivities] = useState<FollowActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'feed' | 'following'>('feed')

  useEffect(() => {
    getFollowActivities().then(a => { setActivities(a); setLoading(false) })
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-onyx">Social</h2>
        <Button variant="primary" size="sm" icon={UserPlus}>Suivre</Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-onyx-100">
        {(['feed', 'following'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-evergreen text-evergreen' : 'border-transparent text-onyx-400'
            }`}
          >
            {t === 'feed' ? 'Fil d\'activité' : 'Suivis'}
          </button>
        ))}
      </div>

      {tab === 'feed' && (
        activities.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <div className="size-14 rounded-full bg-onyx-50 flex items-center justify-center">
              <Users size={24} className="text-onyx-400" />
            </div>
            <p className="font-heading font-bold text-base text-onyx">Aucune activité</p>
            <p className="text-sm text-onyx-400">Suis des joueurs pour voir leur activité</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map(activity => (
              <Card key={activity.id} padding="sm" className="flex items-start gap-3">
                <Avatar name={activity.user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-semibold text-onyx">{activity.user.name}</span>
                    <span className="text-xs text-onyx-400">@{activity.user.username}</span>
                  </div>
                  <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mb-1 ${
                    activity.activity_type === 'session' ? 'bg-evergreen/10 text-evergreen' : 'bg-blue-pp/20 text-blue-pp-dark'
                  }`}>
                    {activity.activity_type === 'session' ? <Dumbbell size={10} /> : <Trophy size={10} />}
                    {activity.activity_type === 'session' ? 'Séance' : 'Match'}
                  </div>
                  <p className="text-sm text-onyx-700">{activity.activity_summary}</p>
                  <p className="text-xs text-onyx-400 mt-1">{formatDateShort(activity.date)}</p>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === 'following' && (
        <div className="space-y-2">
          {mockFollowedUsers.map(user => (
            <Card key={user.id} padding="sm" className="flex items-center gap-3">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-onyx">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-onyx-400">@{user.username}</span>
                  {user.club && <span className="text-xs text-onyx-400">· {user.club}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline">{LEVEL_LABELS[user.level]}</Badge>
                <Button variant="ghost" size="sm" className="text-xs">Ne plus suivre</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
