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
    <div className={cn("bg-ppp-card border border-ppp-border rounded-md p-4 flex flex-col gap-1", className)}>
      <span className="text-[0.7rem] font-serif uppercase tracking-widest text-ppp-muted">{label}</span>
      <span
        className="font-serif font-bold text-4xl leading-none text-ppp-text"
        style={color ? { color } : undefined}
      >
        {value}
      </span>
      {sub && <span className="text-xs font-serif text-ppp-muted">{sub}</span>}
    </div>
  )
}
