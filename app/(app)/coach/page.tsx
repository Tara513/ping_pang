import Link from "next/link"
import type { ReactNode } from "react"
import { Brain, ChevronRight, ClipboardList, History, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Card, CardTitle } from "@/components/ui/Card"
import { getCoachPageData } from "@/lib/data/coach"

export default async function CoachPage() {
  const data = await getCoachPageData()
  const analysedCount = data.analyses.length
  const recentMatches = data.matches.length
  const latestDraft = data.draftProgram

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-bold text-xl text-onyx">Coach IA</h2>
        <p className="text-sm text-onyx-400">Choisis ton espace de travail.</p>
      </div>

      <Card className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Matchs récents" value={String(recentMatches)} />
          <Metric label="Analyses" value={String(analysedCount)} />
          <Metric label="Plan IA" value={latestDraft ? "Brouillon prêt" : "Aucun"} />
          <div className="rounded-[8px] bg-onyx-50 p-3 min-w-0">
            <p className="text-[11px] text-onyx-400 mb-1">PGR</p>
            <Badge variant={data.pgrProfile ? "info" : "outline"}>{data.pgrProfile ? "Lié" : "Absent"}</Badge>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <HubCard
          href="/coach/analysis"
          icon={<Sparkles size={20} />}
          title="Analyser mes matchs"
          description="Sélectionne un match récent, lance l’analyse IA et lis les forces, faiblesses et recommandations."
          meta={`${recentMatches} match${recentMatches > 1 ? "s" : ""} disponible${recentMatches > 1 ? "s" : ""}`}
        />
        <HubCard
          href="/coach/programs"
          icon={<ClipboardList size={20} />}
          title="Mes plans d’entraînement IA"
          description="Crée un brouillon, prévisualise les séances, puis sauvegarde un plan non actif."
          meta={latestDraft ? latestDraft.title : "Aucun brouillon sauvegardé"}
        />
        <HubCard
          href="/coach/analysis#history"
          icon={<History size={20} />}
          title="Historique / suivi"
          description="Retrouve les analyses enregistrées et reviens sur les matchs déjà étudiés."
          meta={`${analysedCount} analyse${analysedCount > 1 ? "s" : ""}`}
        />
      </div>

      <div className="rounded-[8px] bg-onyx-50 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-onyx">
          <Brain size={16} />
          Source IA
        </div>
        <p className="mt-1 text-sm text-onyx-500">
          Les plans utilisent les derniers matchs, les analyses enregistrées, l’objectif hebdo et le profil PGR quand il est lié.
        </p>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-onyx-50 p-3 min-w-0">
      <p className="text-[11px] text-onyx-400 mb-1">{label}</p>
      <p className="truncate text-sm font-semibold text-onyx">{value}</p>
    </div>
  )
}

function HubCard({
  href,
  icon,
  title,
  description,
  meta,
}: {
  href: string
  icon: ReactNode
  title: string
  description: string
  meta: string
}) {
  return (
    <Link href={href}>
      <Card hover className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-evergreen text-pp-white">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <CardTitle className="text-base">{title}</CardTitle>
            <ChevronRight size={17} className="shrink-0 text-onyx-300" />
          </div>
          <p className="text-sm leading-relaxed text-onyx-500">{description}</p>
          <p className="mt-2 truncate text-xs font-medium text-onyx-400">{meta}</p>
        </div>
      </Card>
    </Link>
  )
}
