"use client"

import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Card from "@/components/ui/Card"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import { demoSessions, demoMatches } from "@/lib/seeds/demoData"
import type { Session, Match } from "@/types/database"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Disc, Dumbbell, Swords, Target, Trophy, Coffee, Heart, Star, type LucideIcon } from "lucide-react"

const DEMO_FRIENDS = [
  { id: "f1", username: "thomas_m", full_name: "Thomas M.", avatar_url: null },
  { id: "f2", username: "lea_d", full_name: "Léa D.", avatar_url: null },
  { id: "f3", username: "carlos_r", full_name: "Carlos R.", avatar_url: null },
]

const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill"
}
const SESSION_ICON_MAP: Record<string, LucideIcon> = {
  technique: Disc, physique: Dumbbell, match: Swords,
  service: Target, competition: Trophy, chill: Coffee
}

export default function SocialFeedPage() {
  const allSessions = demoSessions as Partial<Session>[]
  const allMatches = demoMatches as Partial<Match>[]

  const feedItems = [
    ...allSessions.slice(0, 4).map((s, i) => ({
      id: `s${i}`,
      type: "session" as const,
      data: s,
      friend: DEMO_FRIENDS[i % DEMO_FRIENDS.length],
    })),
    ...allMatches.slice(0, 3).map((m, i) => ({
      id: `m${i}`,
      type: "match" as const,
      data: m,
      friend: DEMO_FRIENDS[(i + 1) % DEMO_FRIENDS.length],
    })),
  ].sort((a, b) => new Date(b.data.date!).getTime() - new Date(a.data.date!).getTime())

  return (
    <>
      <TopBar title="Activité amis" />
      <PageWrapper>
        <div className="pt-4 flex flex-col gap-3">
          {/* Following pills */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {DEMO_FRIENDS.map((f) => (
              <div key={f.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <Avatar src={f.avatar_url} name={f.full_name} size="md" />
                <span className="text-[10px] text-olive">{f.username}</span>
              </div>
            ))}
          </div>

          {feedItems.map((item) => {
            const s = item.data as Partial<Session>
            const m = item.data as Partial<Match>
            const isSession = item.type === "session"
            const dateStr = item.data.date
              ? formatDistanceToNow(new Date(item.data.date), { addSuffix: true, locale: fr })
              : ""

            return (
              <Card key={item.id} className="flex gap-3 items-start hover:border-white/20 transition-all">
                <Avatar src={item.friend.avatar_url} name={item.friend.full_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white">{item.friend.full_name}</span>
                    {isSession ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 bg-kaki text-white">
                        {(() => { const Icon = SESSION_ICON_MAP[s.session_type || ""] || Disc; return <Icon size={10} strokeWidth={2} /> })()}
                        {SESSION_LABELS[s.session_type || ""] || s.session_type}
                      </span>
                    ) : (
                      <Badge label={m.result === "win" ? "Victoire" : "Défaite"} color={m.result === "win" ? "kaki" : "red"} />
                    )}
                  </div>
                  <div className="text-xs text-olive mt-0.5">{dateStr}</div>

                  {isSession && (
                    <div className="flex gap-3 mt-2 text-xs text-olive">
                      <span>{Math.round((s.duration_min || 0) / 60 * 10) / 10}h</span>
                      {s.feeling && (
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: s.feeling }).map((_, i) => (
                            <Star key={i} size={9} fill="currentColor" strokeWidth={0} className="text-yellow" />
                          ))}
                        </span>
                      )}
                    </div>
                  )}
                  {!isSession && (
                    <div className="text-xs text-olive mt-2">
                      vs {m.opponent_name} — {m.sets_won}-{m.sets_lost}
                    </div>
                  )}
                </div>
                <button className="text-olive border border-white/20 p-2 hover:border-white/40 hover:text-red transition-all">
                  <Heart size={14} strokeWidth={1.5} />
                </button>
              </Card>
            )
          })}
        </div>
      </PageWrapper>
    </>
  )
}
