import { cn } from "@/lib/utils/cn"

interface BadgeProps {
  label: string
  color?: "green" | "red" | "sage" | "sand" | "surface" | "yellow"
  size?: "sm" | "md"
  className?: string
}

export default function Badge({ label, color = "surface", size = "sm", className }: BadgeProps) {
  const colors = {
    green:   "bg-green/20 text-green-light border border-green/30",
    red:     "bg-red/15 text-red border border-red/30",
    sage:    "bg-sage/10 text-sage border border-sage/20",
    sand:    "bg-sand/10 text-sand border border-sand/20",
    surface: "bg-white/5 text-white/60 border border-white/10",
    yellow:  "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  }
  const sizes = { sm: "text-[10px] px-2 py-0.5", md: "text-xs px-3 py-1" }

  return (
    <span className={cn("inline-flex font-medium uppercase tracking-wider", colors[color], sizes[size], className)}>
      {label}
    </span>
  )
}
