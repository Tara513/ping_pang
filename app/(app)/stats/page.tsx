'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, Legend,
} from 'recharts'
import { Clock, Trophy, Dumbbell, Flame } from 'lucide-react'
import type { AggregatedStats, StatsPeriod } from '@/lib/types'
import { getAggregatedStats } from '@/lib/api'

const PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: '7d', label: '7j' },
  { value: '30d', label: '30j' },
  { value: '6m', label: '6m' },
  { value: 'all', label: 'Tout' },
]

export default function StatsPage() {
  const [stats, setStats] = useState<AggregatedStats | null>(null)
  const [period, setPeriod] = useState<StatsPeriod>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAggregatedStats(period).then(s => { setStats(s); setLoading(false) }).catch(() => setLoading(false))
  }, [period])

  if (loading) return <PageLoader />
  if (!stats) return null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-onyx">Statistiques</h2>
        <div className="flex gap-1 bg-onyx-50 p-0.5 rounded-[8px]">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => {
                if (p.value === period) return
                setLoading(true)
                setPeriod(p.value)
              }}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all ${
                period === p.value ? 'bg-white text-onyx shadow-sm' : 'text-onyx-400 hover:text-onyx'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard icon={Clock} label="Heures totales" value={`${stats.total_hours}h`} color="bg-evergreen/10 text-evergreen" />
        <KpiCard icon={Trophy} label="Win rate" value={`${stats.win_rate}%`} color="bg-blue-pp/20 text-blue-pp-dark" />
        <KpiCard icon={Dumbbell} label="Séances" value={String(stats.total_sessions)} color="bg-lime/40 text-lime-dark" />
        <KpiCard icon={Flame} label="Streak" value={`${stats.streak_days}j`} color="bg-mauve-light text-mauve" />
      </div>

      {/* Hours per week */}
      <Card>
        <CardTitle className="mb-4">Heures par semaine</CardTitle>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={stats.hours_per_week} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e8e8e8' }}
              formatter={(v) => [`${v}h`, 'Heures']}
            />
            <Bar dataKey="hours" fill="#092C25" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Session types radar */}
      <Card>
        <CardTitle className="mb-4">Répartition des séances</CardTitle>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={stats.session_type_distribution} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <PolarGrid stroke="#e8e8e8" />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} />
            <Radar dataKey="count" fill="#092C25" fillOpacity={0.3} stroke="#092C25" strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Feeling / Motivation / Confidence over time */}
      <Card>
        <CardTitle className="mb-4">Ressenti dans le temps</CardTitle>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.feeling_over_time} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e8e8e8' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="motivation" stroke="#A5C6FF" strokeWidth={2} dot={false} name="Motivation" />
            <Line type="monotone" dataKey="confidence" stroke="#E6FFA5" strokeWidth={2} dot={false} name="Confiance" />
            <Line type="monotone" dataKey="feeling" stroke="#092C25" strokeWidth={2} dot={false} name="Ressenti" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <Card padding="sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`size-7 rounded-[6px] flex items-center justify-center ${color}`}>
          <Icon size={14} />
        </div>
        <span className="text-xs text-onyx-400">{label}</span>
      </div>
      <p className="font-heading font-bold text-2xl text-onyx">{value}</p>
    </Card>
  )
}
