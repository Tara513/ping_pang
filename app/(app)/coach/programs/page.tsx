import Link from "next/link"
import { Brain, ChevronLeft, ChevronRight, Clock, ListTodo } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Card, CardTitle } from "@/components/ui/Card"
import { getCoachPageData, getCoachProgramsData, type CoachTrainingProgram } from "@/lib/data/coach"
import { formatDate } from "@/lib/utils/format"
import { TrainingPlanBuilder } from "../components/TrainingPlanBuilder"

export default async function CoachProgramsPage() {
  const [coachData, programs] = await Promise.all([getCoachPageData(), getCoachProgramsData()])
  const latestDraft = programs[0] ?? null

  return (
    <div className="space-y-5">
      <div>
        <Link href="/coach" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-onyx-400">
          <ChevronLeft size={15} />
          Coach IA
        </Link>
        <h2 className="font-heading font-bold text-xl text-onyx">Plans d’entraînement IA</h2>
        <p className="text-sm text-onyx-400">Génère, prévisualise et sauvegarde tes brouillons IA.</p>
      </div>

      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Dernier brouillon généré</CardTitle>
            <p className="mt-1 text-sm text-onyx-500">
              {latestDraft ? latestDraft.title : "Aucun plan IA sauvegardé pour le moment."}
            </p>
          </div>
          <Badge variant={latestDraft ? "success" : "outline"}>{latestDraft ? "Disponible" : "Vide"}</Badge>
        </div>
        {latestDraft && (
          <Link href={`/coach/programs/${latestDraft.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-onyx underline">
            Voir mon plan
            <ChevronRight size={14} />
          </Link>
        )}
      </Card>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-onyx-400">Créer un nouveau plan</p>
        </div>
        <TrainingPlanBuilder data={coachData} />
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-onyx-400">Programmes sauvegardés</p>
        </div>
        {programs.length > 0 ? (
          <div className="space-y-2">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <Card padding="sm" className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-onyx-50 text-onyx-400">
              <ListTodo size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-onyx">Aucun brouillon IA sauvegardé</p>
              <p className="mt-0.5 text-sm text-onyx-500">Génère un brouillon, puis sauvegarde-le pour le retrouver ici.</p>
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}

function ProgramCard({ program }: { program: CoachTrainingProgram }) {
  return (
    <Link href={`/coach/programs/${program.id}`}>
      <Card hover className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <CardTitle className="break-words text-base">{program.title}</CardTitle>
            <Badge variant="lime" size="sm">
              <Brain size={10} className="mr-0.5" />
              IA
            </Badge>
            {!program.is_active && <Badge variant="outline" size="sm">Brouillon</Badge>}
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-onyx-500">
            {program.description || "Programme IA sauvegardé."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-onyx-400">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {program.duration_weeks} sem.
            </span>
            <span>{program.sessions.length} séance{program.sessions.length > 1 ? "s" : ""}</span>
            <span>{formatDate(program.created_at)}</span>
          </div>
        </div>
        <ChevronRight size={17} className="mt-1 shrink-0 text-onyx-300" />
      </Card>
    </Link>
  )
}
