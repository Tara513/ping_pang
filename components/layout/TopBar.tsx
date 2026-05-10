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
  /** Affiche le titre centré, style brand PPP */
  centered?: boolean
}

export default function TopBar({
  title,
  showBack,
  backHref,
  onBack,
  actions,
  className,
  centered,
}: TopBarProps) {
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
    <header className={cn("sticky top-0 z-20 bg-ppp-white border-b border-ppp-border safe-top", className)}>
      <div className={cn("flex items-center h-14 px-5 gap-3", centered && "justify-center relative")}>
        {showBack && (
          <button
            onClick={handleBack}
            className={cn(
              "text-ppp-muted hover:text-ppp-text transition-colors p-1",
              centered ? "absolute left-5" : "-ml-1"
            )}
            aria-label="Retour"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
        )}

        <h1
          className={cn(
            "font-serif font-bold uppercase leading-none",
            centered
              ? "text-base tracking-[0.15em] text-ppp-text"
              : "text-xl tracking-[0.06em] text-ppp-text flex-1"
          )}
        >
          {title}
        </h1>

        {actions && (
          <div className={cn("flex items-center gap-2", centered && "absolute right-5")}>
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
