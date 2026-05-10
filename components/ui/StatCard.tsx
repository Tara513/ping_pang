import { cn } from "@/lib/utils/cn"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
  icon?: string
  className?: string
}

export default function StatCard({ label, value, sub, color, icon, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white border border-gray-100 rounded-2xl p-5 flex flex-col shadow-sm",
      className
    )}>
      {icon && <span className="text-2xl mb-2">{icon}</span>}
      <span
        className="font-serif font-bold text-4xl leading-none"
        style={color ? { color } : { color: "#1A1A1A" }}
      >
        {value}
      </span>
      <span className="text-[10px] font-serif uppercase tracking-[0.12em] text-ppp-muted mt-2">
        {label}
      </span>
      {sub && (
        <span className="text-xs font-serif text-ppp-muted mt-0.5">{sub}</span>
      )}
    </div>
  )
}
