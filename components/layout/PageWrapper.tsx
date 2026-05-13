import { cn } from "@/lib/utils/cn"
import type { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
  className?: string
  size?: "default" | "wide"
}

export default function PageWrapper({ children, className, size = "default" }: PageWrapperProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full px-4 pb-28 pt-5 sm:px-6 lg:pb-10",
        size === "wide" ? "max-w-7xl" : "max-w-6xl",
        className
      )}
    >
      {children}
    </main>
  )
}
