import { Badge } from "@/components/ui/Badge"
import { Card, CardTitle } from "@/components/ui/Card"
import { formatDate } from "@/lib/utils/format"
import type { CoachAnalysisItem, CoachMatchItem } from "../types"

function resultLabel(match: CoachMatchItem) {
  if (match.result === "win") return "Victoire"
  if (match.result === "loss") return "Défaite"
  return "Résultat inconnu"
}

function scoreLabel(match: CoachMatchItem) {
  return match.sets_won !== null && match.sets_lost !== null ? `${match.sets_won}/${match.sets_lost}` : "-"
}

export function MatchPicker({
  matches,
  selectedMatchId,
  analysesByMatch,
  onSelect,
}: {
  matches: CoachMatchItem[]
  selectedMatchId: string
  analysesByMatch: Map<string, CoachAnalysisItem>
  onSelect: (matchId: string) => void
}) {
  return (
    <Card className="space-y-3">
      <CardTitle>Derniers matchs</CardTitle>
      {matches.length > 0 ? (
        <div className="space-y-2">
          {matches.map((match) => {
            const selected = selectedMatchId === match.id
            const analysed = analysesByMatch.has(match.id)

            return (
              <button
                key={match.id}
                type="button"
                onClick={() => onSelect(match.id)}
                className={`w-full rounded-[8px] border p-3 text-left transition-colors ${
                  selected ? "border-evergreen bg-evergreen/5" : "border-onyx-100 hover:border-onyx-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <p className="text-sm font-semibold text-onyx truncate">vs {match.opponent_name}</p>
                      {match.source === "ranking" && <Badge variant="info">PGR</Badge>}
                      {analysed && <Badge variant="success">Analysé</Badge>}
                    </div>
                    <p className="text-xs text-onyx-400">
                      {resultLabel(match)} · {scoreLabel(match)} · {formatDate(match.date)}
                    </p>
                  </div>
                  {selected && <span className="text-xs font-semibold text-evergreen shrink-0">Sélectionné</span>}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-onyx-500">Aucun match disponible.</p>
      )}
    </Card>
  )
}
