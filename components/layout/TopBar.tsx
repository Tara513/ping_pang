"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
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
    <header className={cn("sticky top-0 z-20 bg-white border-b border-gray-100", className)}>
      <div className="flex items-center h-14 px-4 gap-3 max-w-2xl mx-auto">
        {showBack && (
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-ppp-text transition-colors p-1.5 rounded-full hover:bg-gray-50 -ml-1"
            aria-label="Retour"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
        )}
        <h1 className="font-serif font-bold text-lg uppercase tracking-[0.06em] text-ppp-text flex-1 leading-none">
          {title}
        </h1>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
