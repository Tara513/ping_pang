"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import type { ReactNode } from "react"

interface TopBarProps {
  title: string
  showBack?: boolean
  backHref?: string
  onBack?: () => void
  actions?: ReactNode
  className?: string
}

export default function TopBar({ title, showBack, backHref, onBack, actions, className }: TopBarProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) return onBack()
    if (backHref) return router.push(backHref)
    router.back()
  }

  return (
    <header className={cn("sticky top-0 z-20 bg-black/95 backdrop-blur-sm border-b border-white/[0.04]", className)}>
      <div className="flex items-center h-14 px-4 gap-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="text-sage hover:text-white transition-colors text-sm font-sans"
            aria-label="Retour"
          >
            ←
          </button>
        )}
        <h1 className="font-display font-light text-xl text-white flex-1 leading-none">
          {title}
        </h1>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
