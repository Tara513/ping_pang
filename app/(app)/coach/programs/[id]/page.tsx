import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Card, CardTitle } from "@/components/ui/Card"
import { getCoachProgramDetail, type CoachProgramSession } from "@/lib/data/coach"
import { formatDate, SESSION_TYPE_LABELS } from "@/lib/utils/format"

interface CoachProgramDetailPageProps {
  params: Promise<{
    id: string
  }>
}

const dayLabels = ["", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export default async function CoachProgramDetailPage({ params }: CoachProgramDetailPageProps) {
  const { id } = await params
  const program = await getCoachProgramDetail(id)
  const weeks = Array.from(new Set(program.sessions.map((session) => session.week_number))).sort((a, b) => a - b)

  return (
    <div className="space-y-5">
      <div>
        <Link href="/coach/programs" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-onyx-400">
          <ChevronLeft size={15} />
          Plans IA
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words font-heading text-xl font-bold text-onyx">{program.title}</h2>
            <p className="text-sm text-onyx-400">Créé le {formatDate(program.created_at)}</p>
          </div>
          <Badge variant={program.is_active ? "success" : "outline"}>{program.is_active ? "Actif" : "Brouillon"}</Badge>
        </div>
      </div>

      <Card className="space-y-3">
        <CardTitle>Objectif</CardTitle>
        <p className="break-words text-sm leading-relaxed text-onyx-600">
          {program.description || "Aucune description enregistrée."}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Durée" value={`${program.duration_weeks} sem.`} />
          <Metric label="Séances" value={String(program.sessions.length)} />
        </div>
      </Card>

      <div className="space-y-4">
        {weeks.map((week) => (
          <section key={week} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-onyx-400">Semaine {week}</p>
            {program.sessions
              .filter((session) => session.week_number === week)
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
          </section>
        ))}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-onyx-50 p-3">
      <p className="mb-1 text-[11px] text-onyx-400">{label}</p>
      <p className="text-sm font-semibold text-onyx">{value}</p>
    </div>
  )
}

function SessionCard({ session }: { session: CoachProgramSession }) {
  return (
    <Card padding="sm" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-onyx">
            {dayLabels[session.day_of_week] || `Jour ${session.day_of_week}`} · {SESSION_TYPE_LABELS[session.session_type] || session.session_type}
          </p>
          <p className="text-xs text-onyx-400">{session.duration_min ?? "-"} min</p>
        </div>
        <Badge variant={session.completed ? "success" : "outline"} size="sm">
          {session.completed ? "Fait" : "À faire"}
        </Badge>
      </div>

      {session.objectives && <p className="break-words text-sm leading-relaxed text-onyx-600">{session.objectives}</p>}

      {session.exercises.length > 0 && (
        <div className="space-y-1.5">
          {session.exercises.map((exercise, index) => (
            <div key={`${exercise.name}-${index}`} className="rounded-[6px] bg-onyx-50 px-2.5 py-2">
              <p className="break-words text-xs font-semibold text-onyx">{exercise.name}</p>
              {exercise.notes && <p className="mt-0.5 break-words text-xs text-onyx-500">{exercise.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {session.notes && <p className="break-words text-xs text-onyx-400">{session.notes}</p>}
    </Card>
  )
}
