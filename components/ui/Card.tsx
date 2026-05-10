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
          ? "bg-ppp-forest text-ppp-white rounded-none"
          : "bg-ppp-card text-ppp-text rounded-md",
        border && !featured && "border border-ppp-border",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
