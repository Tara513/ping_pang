import { cn } from "@/lib/utils/cn"
import type { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
  className?: string
  hasBottomNav?: boolean
  noPadding?: boolean
}

export default function PageWrapper({ children, className, hasBottomNav = true, noPadding }: PageWrapperProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-black",
        hasBottomNav && "pb-24",
        !noPadding && "px-4",
        className
      )}
    >
      {children}
    </main>
  )
}
