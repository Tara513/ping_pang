import { cn } from "@/lib/utils/cn"

interface BadgeProps {
  label: string
  color?: "kaki" | "red" | "yellow" | "olive" | "anthracite"
  size?: "sm" | "md"
  className?: string
}

const colorMap = {
  kaki: "bg-kaki text-white",
  red: "bg-red text-white",
  yellow: "bg-yellow text-black",
  olive: "bg-olive text-black",
  anthracite: "bg-anthracite text-white border border-white/10",
}

export default function Badge({ label, color = "kaki", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-sans font-semibold uppercase tracking-wider",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1",
        colorMap[color],
        className
      )}
    >
      {label}
    </span>
  )
}
