"use client"

import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import { demoSessions, demoMatches } from "@/lib/seeds/demoData"
import type { Session, Match } from "@/types/database"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"

const DEMO_FRIENDS = [
  { id: "f1", username: "thomas_m", full_name: "Thomas M.", avatar_url: null },
  { id: "f2", username: "lea_d", full_name: "Léa D.", avatar_url: null },
  { id: "f3", username: "carlos_r", full_name: "Carlos R.", avatar_url: null },
]

const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill"
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
      <TopBar title="Activité" />
      <PageWrapper>
        <div className="pt-4">
          {/* Following avatars */}
          <div className="flex gap-4 overflow-x-auto pb-4 mb-6 no-scrollbar">
            {DEMO_FRIENDS.map((f) => (
              <div key={f.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <Avatar src={f.avatar_url} name={f.full_name} size="md" />
                <span className="text-[9px] text-sage font-sans uppercase tracking-[0.1em]">{f.username}</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-white/[0.06] mb-6" />

          <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-5">Feed</div>

          <div className="flex flex-col">
            {feedItems.map((item) => {
              const s = item.data as Partial<Session>
              const m = item.data as Partial<Match>
              const isSession = item.type === "session"
              const dateStr = item.data.date
                ? formatDistanceToNow(new Date(item.data.date), { addSuffix: true, locale: fr })
                : ""

              return (
                <Link
                  key={item.id}
                  href={isSession ? `/session/${item.data.id}` : `/match/${item.data.id}`}
                >
                  <div className="flex gap-4 py-4 border-b border-white/[0.05] active:bg-white/[0.02] transition-colors">
                    <Avatar src={item.friend.avatar_url} name={item.friend.full_name} size="sm" className="flex-shrink-0 self-center" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-sans text-sm text-white font-medium">{item.friend.full_name}</span>
                        {isSession ? (
                          <span className="text-[9px] font-sans uppercase tracking-[0.1em] text-sage">
                            {SESSION_LABELS[s.session_type || ""] || s.session_type}
                          </span>
                        ) : (
                          <Badge label={m.result === "win" ? "Victoire" : "Défaite"} color={m.result === "win" ? "green" : "red"} />
                        )}
                        <span className="text-[10px] text-sage/50 ml-auto flex-shrink-0">{dateStr}</span>
                      </div>

                      {isSession && (
                        <div className="flex gap-3 text-xs text-sage font-sans">
                          <span>{Math.round((s.duration_min || 0) / 60 * 10) / 10}h</span>
                          {s.feeling && <span>{"★".repeat(s.feeling)}</span>}
                        </div>
                      )}
                      {!isSession && (
                        <div className="text-xs text-sage font-sans">
                          vs {m.opponent_name} — {m.sets_won}-{m.sets_lost}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
