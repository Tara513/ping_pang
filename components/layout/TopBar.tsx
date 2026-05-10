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
    if (onBack) {
      onBack()
    } else if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-20 bg-black/95 backdrop-blur-sm border-b border-white/[0.04] safe-top",
        className
      )}
    >
      <div className="flex items-center h-14 px-4 gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="text-sage hover:text-white transition-colors text-lg leading-none -ml-1 pr-2"
            aria-label="Retour"
          >
            ←
          </button>
        )}
        <h1 className="font-display text-lg font-light text-white flex-1 leading-none">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
