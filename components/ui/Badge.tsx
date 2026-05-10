import { cn } from "@/lib/utils/cn"

interface BadgeProps {
  label: string
  color?: "forest" | "gold" | "silver" | "muted" | "red" | "yellow"
  size?: "sm" | "md"
  italic?: boolean
  className?: string
}

const colorMap = {
  forest:  "bg-ppp-forest text-ppp-white",
  gold:    "bg-gradient-to-br from-[#C9A96E] to-[#8B6914] text-white",
  silver:  "bg-gradient-to-br from-[#A0A0A0] to-[#5A5A5A] text-white",
  muted:   "bg-ppp-card text-ppp-forest border border-ppp-border",
  red:     "bg-red text-white",
  yellow:  "bg-yellow text-ppp-text",
}

export default function Badge({ label, color = "forest", size = "sm", italic = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-serif tracking-[0.08em] uppercase rounded-pill",
        italic && "italic",
        size === "sm" ? "text-[0.65rem] px-3 py-0.5" : "text-[0.7rem] px-4 py-1",
        colorMap[color],
        className
      )}
    >
      {label}
    </span>
  )
}
