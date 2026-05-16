import { CardTitle } from "@/components/ui/Card"
import { CheckCircle, Lightbulb, Target, TriangleAlert } from "lucide-react"

type Tone = "strength" | "weakness" | "moment" | "recommendation"

const config = {
  strength: { icon: CheckCircle, color: "text-evergreen", bg: "bg-evergreen/5" },
  weakness: { icon: TriangleAlert, color: "text-mauve", bg: "bg-mauve/5" },
  moment: { icon: Target, color: "text-blue-pp-dark", bg: "bg-blue-pp/10" },
  recommendation: { icon: Lightbulb, color: "text-lime-dark", bg: "bg-lime/20" },
} satisfies Record<Tone, { icon: typeof CheckCircle; color: string; bg: string }>

export function AnalysisSection({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: Tone
}) {
  const Icon = config[tone].icon

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={15} className={config[tone].color} />
        <CardTitle className="text-sm">{title}</CardTitle>
      </div>
      <div className="space-y-2">
        {(items.length > 0 ? items : ["Non renseigné"]).map((item, index) => (
          <div
            key={`${title}-${index}`}
            className={`break-words rounded-[8px] px-3 py-2.5 text-sm leading-relaxed text-onyx-700 ${config[tone].bg}`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
