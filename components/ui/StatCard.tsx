import { cn } from "@/lib/utils/cn"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
  className?: string
}

export default function StatCard({ label, value, sub, color, className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="text-[9px] text-sage uppercase tracking-[0.3em]">{label}</div>
      <div
        className="font-display text-6xl font-light leading-none mt-1"
        style={{ color: color || "#F0EDE6" }}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-sage/60 mt-1">{sub}</div>}
    </div>
  )
}
