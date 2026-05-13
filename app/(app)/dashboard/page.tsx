'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Avatar } from '@/components/ui/Avatar'
import {
  Plus, Trophy, Dumbbell, Flame, Clock,
  ChevronRight, Brain, Zap, Bell, TrendingUp,
} from 'lucide-react'
import type { DashboardStats, ActivityFeedItem, MatchAnalysis, AIReport } from '@/lib/types'
import { getDashboardStats, getActivityFeed, getAnalysis, getAIReports } from '@/lib/api'
import { formatDateShort, formatDuration, FEELING_EMOJIS, SESSION_TYPE_LABELS } from '@/lib/utils/format'
import { mockUser } from '@/lib/mock-data'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [feed, setFeed] = useState<ActivityFeedItem[]>([])
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null)
  const [report, setReport] = useState<AIReport | null>(null)

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getActivityFeed(6),
      getAnalysis('match-1'),
      getAIReports(),
    ]).then(([s, f, a, r]) => {
      setStats(s); setFeed(f); setAnalysis(a); setReport(r[0] ?? null)
    })
  }, [])

  if (!stats) return <PageLoader />

  const { hours_this_week, sessions_this_week, streak_days, sessions_goal_progress, hours_goal_progress } = stats

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <Avatar name={mockUser.name} size="md" />
          <div>
            <p className="text-xs text-onyx-400">Bonjour,</p>
            <h2 className="font-heading font-bold text-lg text-onyx leading-tight">
              {mockUser.name.split(' ')[0]}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-mauve/10 px-2.5 py-1.5 rounded-full">
            <Flame size={13} className="text-mauve" />
            <span className="text-xs font-bold text-mauve">{streak_days}j</span>
          </div>
          <button className="relative size-9 rounded-full bg-onyx-50 flex items-center justify-center">
            <Bell size={16} className="text-onyx-600" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-mauve" />
          </button>
        </div>
      </div>

      {/* ── Hero card — semaine ── */}
      <div className="rounded-[12px] bg-evergreen p-5 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/5" />
        <div className="absolute -right-2 top-8 size-20 rounded-full bg-white/5" />

        <p className="text-xs font-medium text-lime/70 mb-3">Cette semaine</p>
        <div className="grid grid-cols-3 gap-4 relative">
          <HeroMetric label="Heures" value={`${hours_this_week}h`} />
          <HeroMetric label="Séances" value={String(sessions_this_week)} />
          <HeroMetric label="Matchs" value={String(stats.matches_this_week)} />
        </div>

        {/* Goals progress */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <GoalLine
            label="Séances"
            current={sessions_this_week}
            goal={stats.weekly_goal.sessions_per_week}
            progress={sessions_goal_progress}
          />
          <GoalLine
            label="Heures"
            current={hours_this_week}
            goal={stats.weekly_goal.hours_per_week}
            progress={hours_goal_progress}
            unit="h"
          />
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/sessions/new">
          <button className="w-full flex items-center gap-2.5 bg-evergreen/8 border border-evergreen/20 rounded-[10px] px-4 py-3.5 hover:bg-evergreen/12 transition-colors">
            <div className="size-8 rounded-[8px] bg-evergreen flex items-center justify-center shrink-0">
              <Plus size={16} className="text-lime" />
            </div>
            <span className="font-semibold text-sm text-onyx">Séance</span>
          </button>
        </Link>
        <Link href="/matches/new">
          <button className="w-full flex items-center gap-2.5 bg-blue-pp/10 border border-blue-pp/20 rounded-[10px] px-4 py-3.5 hover:bg-blue-pp/15 transition-colors">
            <div className="size-8 rounded-[8px] bg-blue-pp-dark flex items-center justify-center shrink-0">
              <Trophy size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-onyx">Match</span>
          </button>
        </Link>
        <Link href="/chat">
          <button className="w-full flex items-center gap-2.5 bg-lime/20 border border-lime/30 rounded-[10px] px-4 py-3.5 hover:bg-lime/30 transition-colors">
            <div className="size-8 rounded-[8px] bg-lime-dark flex items-center justify-center shrink-0">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-onyx">Ask IA</span>
          </button>
        </Link>
        <Link href="/stats">
          <button className="w-full flex items-center gap-2.5 bg-onyx-50 border border-onyx-100 rounded-[10px] px-4 py-3.5 hover:bg-onyx-100 transition-colors">
            <div className="size-8 rounded-[8px] bg-onyx flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-pp-white" />
            </div>
            <span className="font-semibold text-sm text-onyx">Stats</span>
          </button>
        </Link>
      </div>

      {/* ── AI Insight ── */}
      {report && (
        <Link href="/ai-reports">
          <div className="rounded-[10px] border border-lime/40 bg-lime/10 p-4 flex items-start gap-3">
            <div className="size-9 rounded-[8px] bg-evergreen flex items-center justify-center shrink-0 mt-0.5">
              <Zap size={15} className="text-lime" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-evergreen mb-1">Recommandation IA</p>
              <p className="text-sm text-onyx-700 line-clamp-2">{report.improvements[0]}</p>
            </div>
            <ChevronRight size={14} className="text-onyx-300 shrink-0 mt-1" />
          </div>
        </Link>
      )}

      {/* ── Last AI analysis ── */}
      {analysis && (
        <Link href="/matches/match-1/analysis">
          <div className="rounded-[10px] border border-onyx-100 bg-white p-4 flex items-start gap-3">
            <div className="size-9 rounded-[8px] bg-evergreen/10 flex items-center justify-center shrink-0">
              <Brain size={15} className="text-evergreen" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-onyx-400 mb-1">Dernière analyse</p>
              <p className="text-sm text-onyx font-medium mb-1">vs Thomas Leroy</p>
              <p className="text-xs text-onyx-600 line-clamp-2">{analysis.summary.slice(0, 80)}…</p>
            </div>
            <ChevronRight size={14} className="text-onyx-300 shrink-0 mt-1" />
          </div>
        </Link>
      )}

      {/* ── Activity feed ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-base text-onyx">Activité récente</h3>
          <Link href="/sessions" className="text-xs font-medium text-onyx-400">Tout voir</Link>
        </div>
        <div className="space-y-2">
          {feed.slice(0, 5).map(item => (
            <FeedItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-heading font-black text-2xl text-pp-white leading-none">{value}</p>
      <p className="text-[11px] text-lime/70 mt-0.5">{label}</p>
    </div>
  )
}

function GoalLine({ label, current, goal, progress, unit = '' }: {
  label: string; current: number; goal: number; progress: number; unit?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-pp-white/60 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-lime transition-all duration-500"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <span className="text-[11px] text-pp-white/60 w-12 text-right shrink-0">
        {current}{unit}/{goal}{unit}
      </span>
    </div>
  )
}

function FeedItem({ item }: { item: ActivityFeedItem }) {
  const isSession = item.feed_type === 'session'
  const href = isSession ? `/sessions/${item.id}` : `/matches/${item.id}`

  return (
    <Link href={href}>
      <div className="flex items-center gap-3 py-3 border-b border-onyx-50 last:border-0">
        <div className={`size-10 rounded-[10px] flex items-center justify-center shrink-0 ${isSession ? 'bg-evergreen/10' : 'bg-blue-pp/15'}`}>
          {isSession
            ? <Dumbbell size={17} className="text-evergreen" />
            : <Trophy size={17} className="text-blue-pp-dark" />}
        </div>
        <div className="flex-1 min-w-0">
          {isSession ? (
            <>
              <p className="text-sm font-semibold text-onyx">{SESSION_TYPE_LABELS[item.type]}</p>
              <p className="text-xs text-onyx-400 mt-0.5">{formatDateShort(item.date)} · {formatDuration(item.duration)}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-onyx">vs {item.opponent_name}</p>
              <p className={`text-xs mt-0.5 font-medium ${item.result === 'win' ? 'text-evergreen' : 'text-mauve'}`}>
                {formatDateShort(item.date)} · {item.result === 'win' ? 'Victoire' : 'Défaite'}
              </p>
            </>
          )}
        </div>
        {isSession && (
          <span className="text-lg shrink-0">{FEELING_EMOJIS[item.feeling]}</span>
        )}
      </div>
    </Link>
  )
}
