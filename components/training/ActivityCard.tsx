import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import type { Match, Session } from "@/types/database"
import { SESSION_TYPE_LABELS } from "@/types/app"
import { Clock3, MapPin, Swords, TableTennis } from "lucide-react"
import Link from "next/link"

interface ActivityCardProps {
  item: Partial<Session> | Partial<Match>
  type: "session" | "match"
  href?: string
}

function isMatch(item: Partial<Session> | Partial<Match>): item is Partial<Match> {
  return "opponent_name" in item
}

export default function ActivityCard({ item, type, href }: ActivityCardProps) {
  const match = isMatch(item) ? item : null
  const session = !isMatch(item) ? item : null
  const title = match
    ? `vs ${match.opponent_name || "Adversaire"}`
    : SESSION_TYPE_LABELS[session?.session_type || "technique"]?.fr || "Séance"
  const subtitle = match
    ? `${match.sets_won ?? 0}-${match.sets_lost ?? 0} sets`
    : `${Math.round(((session?.duration_min || 0) / 60) * 10) / 10}h d'entraînement`
  const resultColor = match?.result === "loss" ? "red" : "forest"

  const body = (
    <Card className="group transition hover:border-ppp-forest/35 hover:bg-ppp-surface-2" padding="md">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-ppp-forest">
          {type === "match" ? <Swords className="h-5 w-5" /> : <TableTennis className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-ppp-text">{title}</h3>
            {match?.result && (
              <Badge label={match.result === "win" ? "Victoire" : "Défaite"} color={resultColor} />
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ppp-muted">
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {item.date || "Aujourd'hui"}
            </span>
            <span>{subtitle}</span>
            {item.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {item.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )

  if (!href) return body

  return (
    <Link href={href} className="block">
      {body}
    </Link>
  )
}
