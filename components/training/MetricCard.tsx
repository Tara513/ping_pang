import { cn } from "@/lib/utils/cn"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  detail?: string
  icon?: LucideIcon
  tone?: "default" | "green" | "gold" | "red"
  className?: string
}

const tones = {
  default: "border-white/8 bg-ppp-surface text-ppp-text",
  green: "border-ppp-forest/25 bg-ppp-forest/12 text-ppp-forest",
  gold: "border-ppp-gold/28 bg-ppp-gold/12 text-ppp-gold",
  red: "border-red/25 bg-red/12 text-red",
}

export default function MetricCard({ label, value, detail, icon: Icon, tone = "default", className }: MetricCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", tones[tone], className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ppp-muted">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-black/18">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="text-3xl font-black tracking-tight text-current">{value}</div>
      {detail && <p className="mt-1 text-xs text-ppp-muted">{detail}</p>}
    </div>
  )
}
