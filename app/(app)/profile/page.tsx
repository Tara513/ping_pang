'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Edit, MapPin, Zap, Wrench, Award, Activity, BarChart2, TrendingUp } from 'lucide-react'
import type { UserProfile, TrainingSession, Match, EloRating, Equipment, Badge as BadgeType } from '@/lib/types'
import { getUser, getSessions, getMatches, getEloRatings, getActiveEquipment, getBadges } from '@/lib/api'
import { LEVEL_LABELS, STYLE_LABELS, formatDate, formatElo, FEDERATION_LABELS } from '@/lib/utils/format'

const TABS = ['Activité', 'Stats', 'ELO', 'Matériel', 'Badges'] as const
type Tab = typeof TABS[number]

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [ratings, setRatings] = useState<EloRating[]>([])
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [tab, setTab] = useState<Tab>('Activité')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getUser(), getSessions(), getMatches(), getEloRatings(), getActiveEquipment(), getBadges()])
      .then(([u, s, m, r, eq, b]) => {
        setUser(u); setSessions(s); setMatches(m); setRatings(r); setEquipment(eq); setBadges(b)
        setLoading(false)
      })
  }, [])

  if (loading || !user) return <PageLoader />

  const wins = matches.filter(m => m.result === 'win').length
  const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60
  const unlockedBadges = badges.filter(b => b.unlocked).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex items-start gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-xl text-onyx">{user.name}</h2>
            <p className="text-sm text-onyx-400">@{user.username}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="lime">{LEVEL_LABELS[user.level]}</Badge>
              <Badge variant="outline">{STYLE_LABELS[user.playing_style]}</Badge>
              {user.coach_mode && <Badge variant="blue">Mode coach</Badge>}
            </div>
          </div>
          <Link href="/profile/edit">
            <Button variant="ghost" size="sm" icon={Edit} />
          </Link>
        </div>
        <div className="mt-3 pt-3 border-t border-onyx-100 flex items-center gap-4 text-sm text-onyx-400">
          {user.club && <span className="flex items-center gap-1"><Zap size={13} />{user.club}</span>}
          <span className="flex items-center gap-1"><MapPin size={13} />{user.city}</span>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-onyx-100 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-evergreen text-evergreen' : 'border-transparent text-onyx-400 hover:text-onyx'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Activité' && (
        <div className="space-y-2">
          {[...sessions.slice(0, 3).map(s => ({ type: 'session' as const, data: s })),
            ...matches.slice(0, 3).map(m => ({ type: 'match' as const, data: m }))
          ]
            .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
            .slice(0, 5)
            .map(item => (
              item.type === 'session' ? (
                <Link key={item.data.id} href={`/sessions/${item.data.id}`}>
                  <Card padding="sm" hover>
                    <p className="text-sm font-medium text-onyx">{formatDate(item.data.date)}</p>
                    <p className="text-xs text-onyx-400">Séance · {item.data.duration}min</p>
                  </Card>
                </Link>
              ) : (
                <Link key={item.data.id} href={`/matches/${item.data.id}`}>
                  <Card padding="sm" hover>
                    <p className="text-sm font-medium text-onyx">vs {(item.data as Match).opponent_name}</p>
                    <p className={`text-xs ${(item.data as Match).result === 'win' ? 'text-evergreen' : 'text-mauve'}`}>
                      {(item.data as Match).result === 'win' ? 'Victoire' : 'Défaite'} · {formatDate(item.data.date)}
                    </p>
                  </Card>
                </Link>
              )
            ))}
        </div>
      )}

      {tab === 'Stats' && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Heures totales" value={`${totalHours.toFixed(1)}h`} />
          <StatCard label="Séances" value={String(sessions.length)} />
          <StatCard label="Matchs" value={String(matches.length)} />
          <StatCard label="Victoires" value={String(wins)} />
          <StatCard label="Win rate" value={matches.length ? `${Math.round((wins / matches.length) * 100)}%` : '—'} />
          <StatCard label="Badges" value={`${unlockedBadges}/${badges.length}`} />
        </div>
      )}

      {tab === 'ELO' && (
        <div className="space-y-3">
          {ratings.map(r => (
            <Card key={r.id} padding="sm" className="flex items-center justify-between">
              <div>
                <p className="text-xs text-onyx-400 mb-0.5">{FEDERATION_LABELS[r.federation]}</p>
                <p className="font-heading font-bold text-xl text-onyx">{formatElo(r.rating)}</p>
              </div>
              <div className="text-right">
                {r.percentile && <p className="text-xs text-onyx-400">Top {100 - r.percentile}%</p>}
                <Badge variant={r.confidence === 'high' ? 'success' : r.confidence === 'medium' ? 'warning' : 'danger'} size="sm">
                  {r.confidence === 'high' ? 'Haute' : r.confidence === 'medium' ? 'Moyenne' : 'Faible'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'Matériel' && equipment && (
        <div className="space-y-3">
          <Card>
            <CardTitle className="mb-3">Matériel actif</CardTitle>
            <div className="space-y-2 text-sm">
              <Row label="Bois" value={`${equipment.blade.brand} ${equipment.blade.model}`} />
              <Row label="CD" value={`${equipment.forehand_rubber.brand} ${equipment.forehand_rubber.model} (${equipment.forehand_rubber.thickness})`} />
              <Row label="RV" value={`${equipment.backhand_rubber.brand} ${equipment.backhand_rubber.model} (${equipment.backhand_rubber.thickness})`} />
              <Row label="Heures jouées" value={`${equipment.hours_played}h`} />
              <Row label="Depuis" value={formatDate(equipment.start_date)} />
            </div>
          </Card>
          <Link href="/equipment">
            <Button variant="outline" fullWidth icon={Wrench}>Gérer le matériel</Button>
          </Link>
        </div>
      )}

      {tab === 'Badges' && (
        <div className="grid grid-cols-3 gap-2">
          {badges.slice(0, 9).map(badge => (
            <Card key={badge.id} padding="sm" className={`text-center ${!badge.unlocked ? 'opacity-40' : ''}`}>
              <div className="text-2xl mb-1">{badge.unlocked ? '★' : '☆'}</div>
              <p className="text-[10px] font-medium text-onyx leading-tight">{badge.name}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm" className="text-center">
      <p className="font-heading font-bold text-xl text-onyx">{value}</p>
      <p className="text-xs text-onyx-400 mt-0.5">{label}</p>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-onyx-50 last:border-0">
      <span className="text-onyx-400">{label}</span>
      <span className="font-medium text-onyx">{value}</span>
    </div>
  )
}
