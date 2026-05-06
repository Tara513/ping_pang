import { cn } from "@/lib/utils/cn"
import { type HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg"
  border?: boolean
}

export default function Card({ className, padding = "md", border = true, children, ...props }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  }

  return (
    <div
      className={cn(
        "bg-anthracite",
        border && "border border-white/[0.08]",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
