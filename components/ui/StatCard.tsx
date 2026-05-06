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
    <div className={cn("bg-anthracite border border-white/[0.08] p-4 flex flex-col gap-1", className)}>
      <span className="text-[10px] font-semibold text-olive uppercase tracking-widest">{label}</span>
      <span
        className="font-display text-4xl leading-none"
        style={color ? { color } : undefined}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-olive">{sub}</span>}
    </div>
  )
}
