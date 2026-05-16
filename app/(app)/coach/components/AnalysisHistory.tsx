import { Badge } from "@/components/ui/Badge"
import { Card, CardTitle } from "@/components/ui/Card"
import { formatDate } from "@/lib/utils/format"
import type { CoachAnalysisItem, CoachMatchItem } from "../types"

export function AnalysisHistory({
  analyses,
  matchesById,
  selectedAnalysisId,
  onSelect,
}: {
  analyses: CoachAnalysisItem[]
  matchesById: Map<string, CoachMatchItem>
  selectedAnalysisId: string | null
  onSelect: (analysis: CoachAnalysisItem) => void
}) {
  return (
    <Card className="space-y-3">
      <CardTitle>Historique</CardTitle>
      {analyses.length > 0 ? (
        <div className="space-y-2">
          {analyses.map((analysis) => {
            const match = matchesById.get(analysis.match_id)
            const selected = selectedAnalysisId === analysis.id

            return (
              <button
                key={analysis.id}
                type="button"
                onClick={() => onSelect(analysis)}
                className={`w-full rounded-[8px] border p-3 text-left transition-colors ${
                  selected ? "border-evergreen bg-evergreen/5" : "border-onyx-100 hover:border-onyx-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-onyx truncate">
                      {match ? `vs ${match.opponent_name}` : "Match non disponible"}
                    </p>
                    <p className="text-xs text-onyx-400">
                      {formatDate(match?.date || analysis.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {match?.source === "ranking" && <Badge variant="info">PGR</Badge>}
                    {analysis.rating !== null && <Badge variant="lime">{analysis.rating}</Badge>}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-onyx-500 line-clamp-2">{analysis.summary}</p>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-onyx-500">Aucune analyse enregistrée.</p>
      )}
    </Card>
  )
}
