import { cn } from "@/lib/utils/cn"
import { type HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg"
  tone?: "default" | "elevated" | "accent" | "light"
}

export default function Card({
  className,
  padding = "md",
  tone = "default",
  children,
  ...props
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-7",
  }

  const tones = {
    default: "border-white/8 bg-ppp-surface text-ppp-text",
    elevated: "border-white/10 bg-ppp-surface-2 text-ppp-text shadow-[0_18px_56px_rgba(0,0,0,0.25)]",
    accent: "border-ppp-forest/28 bg-ppp-forest/12 text-ppp-text",
    light: "border-transparent bg-ppp-card text-black",
  }

  return (
    <div
      className={cn("rounded-lg border transition-colors", tones[tone], paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}
