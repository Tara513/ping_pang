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
      <span
        className="font-display font-light leading-none"
        style={{ fontSize: "48px", color: color || "#F0EDE6" }}
      >
        {value}
      </span>
      <span className="text-[9px] font-sans uppercase tracking-[0.2em] text-sage mt-2">
        {label}
      </span>
      {sub && (
        <span className="text-xs font-sans text-sage/50 mt-0.5">{sub}</span>
      )}
    </div>
  )
}
