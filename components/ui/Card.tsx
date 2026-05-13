import { cn } from "@/lib/utils/cn"
import { type HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg"
  border?: boolean
  featured?: boolean
}

export default function Card({ className, padding = "md", border = true, featured = false, children, ...props }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-7",
  }

  return (
    <div
      className={cn(
        "transition-all duration-200",
        featured
          ? "bg-green text-white"
          : "bg-surface text-white",
        border && !featured && "border border-white/[0.06]",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
