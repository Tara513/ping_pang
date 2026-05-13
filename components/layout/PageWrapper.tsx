import { cn } from "@/lib/utils/cn"
import type { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export default function PageWrapper({ children, className, noPadding }: PageWrapperProps) {
  return (
    <main className={cn("bg-black w-full min-h-screen pb-24", !noPadding && "px-4", className)}>
      {children}
    </main>
  )
}
