'use client'

import { useEffect, useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ChevronLeft, ChevronRight, Dumbbell, Trophy } from 'lucide-react'
import type { TrainingSession, Match } from '@/lib/types'
import { getSessions, getMatches } from '@/lib/api'
import { formatDate, formatDuration, SESSION_TYPE_LABELS } from '@/lib/utils/format'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, addMonths, subMonths, parseISO,
} from 'date-fns'
import { fr } from 'date-fns/locale'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSessions(), getMatches()]).then(([s, m]) => {
      setSessions(s)
      setMatches(m)
      setLoading(false)
    })
  }, [])

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startPad = (startOfMonth(currentMonth).getDay() + 6) % 7 // Monday-first

  const getDayData = (day: Date) => ({
    sessions: sessions.filter(s => isSameDay(parseISO(s.date), day)),
    matches: matches.filter(m => isSameDay(parseISO(m.date), day)),
  })

  const monthSessions = sessions.filter(s => isSameMonth(parseISO(s.date), currentMonth))
  const monthMatches = matches.filter(m => isSameMonth(parseISO(m.date), currentMonth))
  const monthHours = monthSessions.reduce((sum, s) => sum + s.duration, 0) / 60

  const selectedData = selectedDay ? getDayData(selectedDay) : null

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1.5 hover:bg-onyx-50 rounded-[6px]">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-heading font-bold text-lg text-onyx capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1.5 hover:bg-onyx-50 rounded-[6px]">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Card padding="sm">
          <p className="font-heading font-bold text-lg text-onyx">{monthSessions.length}</p>
          <p className="text-[10px] text-onyx-400">Séances</p>
        </Card>
        <Card padding="sm">
          <p className="font-heading font-bold text-lg text-onyx">{monthMatches.length}</p>
          <p className="text-[10px] text-onyx-400">Matchs</p>
        </Card>
        <Card padding="sm">
          <p className="font-heading font-bold text-lg text-onyx">{monthHours.toFixed(1)}h</p>
          <p className="text-[10px] text-onyx-400">Heures</p>
        </Card>
      </div>

      {/* Calendar grid */}
      <Card padding="sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-onyx-400 py-1">{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const { sessions: ds, matches: dm } = getDayData(day)
            const hasActivity = ds.length > 0 || dm.length > 0
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative flex flex-col items-center py-1.5 rounded-[6px] transition-colors ${
                  isSelected ? 'bg-evergreen text-pp-white' :
                  isToday ? 'bg-onyx-50 font-bold' : 'hover:bg-onyx-50'
                }`}
              >
                <span className={`text-xs ${isSelected ? 'text-pp-white' : 'text-onyx'} ${isToday && !isSelected ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>
                {hasActivity && (
                  <div className="flex gap-0.5 mt-0.5">
                    {ds.length > 0 && <span className={`size-1.5 rounded-full ${isSelected ? 'bg-lime' : 'bg-evergreen'}`} />}
                    {dm.length > 0 && <span className={`size-1.5 rounded-full ${isSelected ? 'bg-blue-pp' : 'bg-blue-pp-dark'}`} />}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Day detail */}
      {selectedDay && selectedData && (
        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-base text-onyx">
            {formatDate(selectedDay)}
          </h3>
          {selectedData.sessions.length === 0 && selectedData.matches.length === 0 && (
            <p className="text-sm text-onyx-400">Aucune activité ce jour</p>
          )}
          {selectedData.sessions.map(s => (
            <Card key={s.id} padding="sm" className="flex items-center gap-3">
              <div className="size-8 rounded-[6px] bg-evergreen/10 flex items-center justify-center">
                <Dumbbell size={14} className="text-evergreen" />
              </div>
              <div>
                <p className="text-sm font-medium text-onyx">{SESSION_TYPE_LABELS[s.type]}</p>
                <p className="text-xs text-onyx-400">{formatDuration(s.duration)}{s.location && ` · ${s.location}`}</p>
              </div>
            </Card>
          ))}
          {selectedData.matches.map(m => (
            <Card key={m.id} padding="sm" className="flex items-center gap-3">
              <div className={`size-8 rounded-[6px] flex items-center justify-center ${m.result === 'win' ? 'bg-evergreen/10' : 'bg-mauve-light'}`}>
                <Trophy size={14} className={m.result === 'win' ? 'text-evergreen' : 'text-mauve'} />
              </div>
              <div>
                <p className="text-sm font-medium text-onyx">vs {m.opponent_name}</p>
                <p className="text-xs text-onyx-400">{m.result === 'win' ? 'Victoire' : 'Défaite'}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
