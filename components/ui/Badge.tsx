import { cn } from "@/lib/utils/cn"

interface BadgeProps {
  label: string
  color?: "green" | "red" | "sage" | "sand" | "surface" | "yellow"
  size?: "sm" | "md"
  className?: string
}

const colorMap = {
  green:   "border border-green-light text-green-light",
  red:     "border border-red text-red",
  sage:    "border border-sage/40 text-sage",
  sand:    "border border-sand/40 text-sand",
  surface: "bg-surface border border-white/10 text-white/60",
  yellow:  "border border-sand/60 text-sand",
}

export default function Badge({ label, color = "surface", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-sans uppercase tracking-[0.12em]",
        size === "sm" ? "text-[9px] px-2 py-0.5" : "text-[10px] px-3 py-1",
        colorMap[color],
        className
      )}
    >
      {label}
    </span>
  )
}
