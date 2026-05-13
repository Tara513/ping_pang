"use client"

import Avatar from "@/components/ui/Avatar"
import { cn } from "@/lib/utils/cn"
import { ArrowLeft, Command, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

interface TopBarProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backHref?: string
  onBack?: () => void
  actions?: ReactNode
  className?: string
}

export default function TopBar({
  title,
  subtitle,
  showBack,
  backHref,
  onBack,
  actions,
  className,
}: TopBarProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }
    if (backHref) {
      router.push(backHref)
      return
    }
    router.back()
  }

  return (
    <header className={cn("sticky top-0 z-30 border-b border-white/8 bg-ppp-bg/82 backdrop-blur-xl", className)}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {showBack && (
          <button
            onClick={handleBack}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-ppp-muted transition hover:border-ppp-forest hover:text-ppp-forest"
            aria-label="Retour"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-ppp-text sm:text-lg">{title}</h1>
          {subtitle && <p className="truncate text-xs text-ppp-muted">{subtitle}</p>}
        </div>
        <div className="hidden min-w-[260px] items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm text-ppp-muted md:flex">
          <Search className="h-4 w-4" />
          <span className="flex-1">Rechercher une séance, un match...</span>
          <Command className="h-3.5 w-3.5" />
        </div>
        {actions}
        <Avatar size="sm" name="Ping Pang" className="hidden sm:flex" />
      </div>
    </header>
  )
}
