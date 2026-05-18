import Link from "next/link"
import type { ReactNode } from "react"
import { Avatar } from "@/components/ui/Avatar"
import { getTrainingDashboardData, type TrainingDashboardActivity } from "@/lib/data/shared-profile"
import { formatDateShort, formatDuration, FEELING_EMOJIS, SESSION_TYPE_LABELS } from "@/lib/utils/format"
import {
  Plus,
  Trophy,
  Dumbbell,
  Flame,
  ChevronRight,
  Brain,
  Zap,
  Bell,
  TrendingUp,
} from "lucide-react"

export default async function DashboardPage() {
  const { profile, stats, feed, latestRecommendation } = await getTrainingDashboardData()
  const displayName = profile.full_name || profile.username || "Joueur"
  const firstName = displayName.split(" ")[0] || "Joueur"

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} size="md" />
          <div>
            <p className="text-xs text-onyx-400">Bonjour,</p>
            <h2 className="font-heading font-bold text-lg text-onyx leading-tight">
              {firstName}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-mauve/10 px-2.5 py-1.5 rounded-full">
            <Flame size={13} className="text-mauve" />
            <span className="text-xs font-bold text-mauve">{stats.streak_days}j</span>
          </div>
          <button className="relative size-9 rounded-full bg-onyx-50 flex items-center justify-center">
            <Bell size={16} className="text-onyx-600" />
          </button>
        </div>
      </div>

      <div className="rounded-[12px] bg-evergreen p-5 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/5" />
        <div className="absolute -right-2 top-8 size-20 rounded-full bg-white/5" />

        <p className="text-xs font-medium text-lime/70 mb-3">Cette semaine</p>
        <div className="grid grid-cols-3 gap-4 relative">
          <HeroMetric label="Heures" value={`${stats.hours_this_week}h`} />
          <HeroMetric label="Séances" value={String(stats.sessions_this_week)} />
          <HeroMetric label="Matchs" value={String(stats.matches_this_week)} />
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <GoalLine
            label="Séances"
            current={stats.sessions_this_week}
            goal={stats.weekly_goal.sessions_per_week}
            progress={stats.sessions_goal_progress}
          />
          <GoalLine
            label="Heures"
            current={stats.hours_this_week}
            goal={stats.weekly_goal.hours_per_week}
            progress={stats.hours_goal_progress}
            unit="h"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <QuickAction href="/sessions/new" icon={<Plus size={16} className="text-lime" />} label="Séance" tone="training" />
        <QuickAction href="/matches/new" icon={<Trophy size={16} className="text-white" />} label="Match" tone="match" />
        <QuickAction href="/coach" icon={<Brain size={16} className="text-white" />} label="Ask IA" tone="ai" />
        <QuickAction href="/stats" icon={<TrendingUp size={16} className="text-pp-white" />} label="Stats" tone="stats" />
      </div>

      {latestRecommendation && (
        <Link href="/ai-reports">
          <div className="rounded-[10px] border border-lime/40 bg-lime/10 p-4 flex items-start gap-3">
            <div className="size-9 rounded-[8px] bg-evergreen flex items-center justify-center shrink-0 mt-0.5">
              <Zap size={15} className="text-lime" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-evergreen mb-1">Recommandation IA</p>
              <p className="text-sm text-onyx-700 line-clamp-2">{latestRecommendation}</p>
            </div>
            <ChevronRight size={14} className="text-onyx-300 shrink-0 mt-1" />
          </div>
        </Link>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-base text-onyx">Activité récente</h3>
          <Link href="/sessions" className="text-xs font-medium text-onyx-400">
            Tout voir
          </Link>
        </div>
        <div className="space-y-2">
          {feed.length > 0 ? (
            feed.slice(0, 5).map((item) => <FeedItem key={`${item.feed_type}-${item.id}`} item={item} />)
          ) : (
            <div className="rounded-[10px] border border-onyx-100 bg-white p-4 text-sm text-onyx-500">
              Aucune activité enregistrée pour le moment.
            </div>
          )}
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

function GoalLine({
  label,
  current,
  goal,
  progress,
  unit = "",
}: {
  label: string
  current: number
  goal: number
  progress: number
  unit?: string
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
        {current}
        {unit}/{goal}
        {unit}
      </span>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  label,
  tone,
}: {
  href: string
  icon: ReactNode
  label: string
  tone: "training" | "match" | "ai" | "stats"
}) {
  const styles = {
    training: "bg-evergreen/8 border-evergreen/20 hover:bg-evergreen/12 [&>div]:bg-evergreen",
    match: "bg-blue-pp/10 border-blue-pp/20 hover:bg-blue-pp/15 [&>div]:bg-blue-pp-dark",
    ai: "bg-lime/20 border-lime/30 hover:bg-lime/30 [&>div]:bg-lime-dark",
    stats: "bg-onyx-50 border-onyx-100 hover:bg-onyx-100 [&>div]:bg-onyx",
  }

  return (
    <Link href={href}>
      <button className={`w-full flex items-center gap-2.5 border rounded-[10px] px-4 py-3.5 transition-colors ${styles[tone]}`}>
        <div className="size-8 rounded-[8px] flex items-center justify-center shrink-0">{icon}</div>
        <span className="font-semibold text-sm text-onyx">{label}</span>
      </button>
    </Link>
  )
}

function FeedItem({ item }: { item: TrainingDashboardActivity }) {
  const isSession = item.feed_type === "session"
  const href = isSession ? `/sessions/${item.id}` : `/matches/${item.id}`
  const label = item.session_type ? SESSION_TYPE_LABELS[item.session_type] || item.session_type : "Séance"

  return (
    <Link href={href}>
      <div className="flex items-center gap-3 py-3 border-b border-onyx-50 last:border-0">
        <div className={`size-10 rounded-[10px] flex items-center justify-center shrink-0 ${isSession ? "bg-evergreen/10" : "bg-blue-pp/15"}`}>
          {isSession ? (
            <Dumbbell size={17} className="text-evergreen" />
          ) : (
            <Trophy size={17} className="text-blue-pp-dark" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isSession ? (
            <>
              <p className="text-sm font-semibold text-onyx">{label}</p>
              <p className="text-xs text-onyx-400 mt-0.5">
                {formatDateShort(item.date)} · {formatDuration(item.duration_min || 0)}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-onyx">vs {item.opponent_name}</p>
              <p className={`text-xs mt-0.5 font-medium ${item.result === "win" ? "text-evergreen" : "text-mauve"}`}>
                {formatDateShort(item.date)} · {item.result === "win" ? "Victoire" : "Défaite"}
              </p>
            </>
          )}
        </div>
        {isSession && item.feeling && <span className="text-lg shrink-0">{FEELING_EMOJIS[item.feeling]}</span>}
      </div>
    </Link>
  )
}
