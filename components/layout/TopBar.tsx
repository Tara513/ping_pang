"use client"

import Link from "next/link"
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
    if (onBack) {
      onBack()
    } else if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <header className={cn("sticky top-0 z-20 bg-black border-b border-white/[0.06] safe-top", className)}>
      <div className="flex items-center h-14 px-4 gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="text-olive hover:text-white transition-colors p-1 -ml-1"
            aria-label="Retour"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="font-display text-2xl uppercase text-white flex-1 leading-none pt-0.5">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
