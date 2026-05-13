import { cn } from "@/lib/utils/cn"

interface BadgeProps {
  label: string
  color?: "forest" | "gold" | "silver" | "muted" | "red" | "yellow" | "dark"
  size?: "sm" | "md"
  className?: string
}

const colorMap = {
  forest: "border-ppp-forest/30 bg-ppp-forest/14 text-ppp-forest",
  gold: "border-ppp-gold/35 bg-ppp-gold/14 text-ppp-gold",
  silver: "border-ppp-silver/25 bg-ppp-silver/10 text-ppp-silver",
  muted: "border-white/10 bg-white/6 text-ppp-muted",
  red: "border-red/30 bg-red/12 text-red",
  yellow: "border-yellow/30 bg-yellow/12 text-yellow",
  dark: "border-black/10 bg-black text-white",
}

export default function Badge({ label, color = "muted", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold uppercase tracking-[0.08em]",
        size === "sm" ? "px-2.5 py-1 text-[0.65rem]" : "px-3 py-1.5 text-xs",
        colorMap[color],
        className
      )}
    >
      {label}
    </span>
  )
}
