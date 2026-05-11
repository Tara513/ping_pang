import { cn } from "@/lib/utils/cn"
import type { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export default function PageWrapper({ children, className, noPadding }: PageWrapperProps) {
  return (
    <main className={cn("bg-ppp-bg w-full max-w-2xl mx-auto", !noPadding && "px-4", className)}>
      {children}
    </main>
  )
}
