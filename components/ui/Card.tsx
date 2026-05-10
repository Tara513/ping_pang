import { cn } from "@/lib/utils/cn"
import { type HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "line" | "block" | "accent" | "green" | "elevated"
  padding?: "none" | "sm" | "md" | "lg"
}

export default function Card({ variant = "default", padding, className, children, ...props }: CardProps) {
  const variants = {
    default:  "bg-surface border border-white/[0.06] p-4",
    line:     "border-b border-white/[0.06] py-4",
    block:    "bg-surface py-5 px-5",
    accent:   "border-l-[3px] border-green-light bg-surface/50 pl-4 py-4",
    green:    "bg-green/10 border border-green/30 p-4",
    elevated: "bg-surface border border-white/10 p-4",
  }

  const pads: Record<string, string> = {
    none: "!p-0",
    sm:   "!p-3",
    md:   "!p-4",
    lg:   "!p-6",
  }

  return (
    <div
      className={cn(
        variants[variant],
        padding && pads[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
