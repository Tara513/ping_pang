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

const DEMO_FRIENDS = [
  { id: "f1", username: "thomas_m", full_name: "Thomas M.", avatar_url: null },
  { id: "f2", username: "lea_d", full_name: "Léa D.", avatar_url: null },
  { id: "f3", username: "carlos_r", full_name: "Carlos R.", avatar_url: null },
]

const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill"
}
const SESSION_ICONS: Record<string, string> = {
  technique: "🏓", physique: "💪", match: "⚔️", service: "🎯", competition: "🏆", chill: "😎"
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
                <span className="text-[10px] text-ppp-muted font-serif">{f.username}</span>
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
              <Card key={item.id} className="flex gap-3 items-start hover:border-ppp-text/20 transition-all">
                <Avatar src={item.friend.avatar_url} name={item.friend.full_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm font-serif text-ppp-text">{item.friend.full_name}</span>
                    {isSession ? (
                      <span className="text-[10px] font-semibold font-serif uppercase px-2 py-0.5 bg-ppp-forest text-ppp-white rounded-sm">
                        {SESSION_ICONS[s.session_type || ""]} {SESSION_LABELS[s.session_type || ""] || s.session_type}
                      </span>
                    ) : (
                      <Badge label={m.result === "win" ? "Victoire" : "Défaite"} color={m.result === "win" ? "forest" : "red"} />
                    )}
                  </div>
                  <div className="text-xs text-ppp-muted font-serif mt-0.5">{dateStr}</div>

                  {isSession && (
                    <div className="flex gap-3 mt-2 text-xs text-ppp-muted font-serif">
                      <span>{Math.round((s.duration_min || 0) / 60 * 10) / 10}h</span>
                      {s.feeling && <span>{"⭐".repeat(s.feeling)}</span>}
                    </div>
                  )}
                  {!isSession && (
                    <div className="text-xs text-ppp-muted font-serif mt-2">
                      vs {m.opponent_name} — {m.sets_won}-{m.sets_lost}
                    </div>
                  )}
                </div>
                <button className="text-[10px] text-ppp-muted border border-ppp-border px-2 py-1 hover:border-ppp-text transition-all uppercase font-serif rounded-sm">
                  ❤
                </button>
              </Card>
            )
          })}
        </div>
      </PageWrapper>
    </>
  )
}
