import { Badge } from "@/components/ui/Badge"
import { Card, CardTitle } from "@/components/ui/Card"
import type { TrainingPlanDraft } from "../types"

const dayLabels = ["", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export function TrainingPlanPreview({ plan }: { plan: TrainingPlanDraft }) {
  const weeks = Array.from(new Set(plan.sessions.map((session) => session.week_number))).sort((a, b) => a - b)

  return (
    <Card className="space-y-4 border-evergreen/20">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <CardTitle className="break-words">{plan.title}</CardTitle>
          <Badge variant="warning">Brouillon non sauvegardé</Badge>
        </div>
        <p className="break-words text-sm leading-relaxed text-onyx-600">{plan.description}</p>
      </div>

      {plan.main_objective && (
        <div className="rounded-[8px] bg-lime/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-lime-dark mb-1">Objectif principal</p>
          <p className="break-words text-sm text-onyx-700">{plan.main_objective}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Metric label="Durée" value={`${plan.duration_weeks} sem.`} />
        <Metric label="Séances" value={String(plan.sessions.length)} />
      </div>

      <div className="space-y-3">
        {weeks.map((week) => (
          <div key={week} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-onyx-400">Semaine {week}</p>
            {plan.sessions
              .filter((session) => session.week_number === week)
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map((session, index) => (
                <div key={`${week}-${session.day_of_week}-${index}`} className="rounded-[8px] border border-onyx-100 p-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="break-words text-sm font-semibold text-onyx">
                        {dayLabels[session.day_of_week] || `Jour ${session.day_of_week}`} · {session.session_type}
                      </p>
                      <p className="text-xs text-onyx-400">{session.duration_min ?? "-"} min</p>
                    </div>
                    <Badge variant="outline">{session.session_type}</Badge>
                  </div>
                  {session.objectives && <p className="mb-2 break-words text-sm text-onyx-700">{session.objectives}</p>}
                  {session.exercises.length > 0 && (
                    <div className="space-y-1.5">
                      {session.exercises.map((exercise, exerciseIndex) => (
                        <div key={`${exercise.name}-${exerciseIndex}`} className="rounded-[6px] bg-onyx-50 px-2.5 py-2">
                          <p className="break-words text-xs font-semibold text-onyx">{exercise.name}</p>
                          {exercise.notes && <p className="mt-0.5 break-words text-xs text-onyx-500">{exercise.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-onyx-50 p-3">
      <p className="text-[11px] text-onyx-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-onyx">{value}</p>
    </div>
  )
}
