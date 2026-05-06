"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, Map, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Feed" },
  { href: "/stats", icon: BarChart2, label: "Stats" },
  { href: "/map", icon: Map, label: "Carte" },
  { href: "/profile", icon: User, label: "Profil" },
]

interface QuickActionMenuProps {
  onClose: () => void
}

function QuickActionMenu({ onClose }: QuickActionMenuProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/80"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 items-center"
      >
        <Link
          href="/session/new"
          onClick={onClose}
          className="bg-kaki text-white px-8 py-3 font-sans font-semibold text-sm uppercase tracking-wide flex items-center gap-3 min-w-[200px] justify-center"
        >
          <span>🏓</span> Logger une séance
        </Link>
        <Link
          href="/match/new"
          onClick={onClose}
          className="bg-anthracite border border-white/20 text-white px-8 py-3 font-sans font-semibold text-sm uppercase tracking-wide flex items-center gap-3 min-w-[200px] justify-center"
        >
          <span>⚔️</span> Logger un match
        </Link>
      </motion.div>
    </AnimatePresence>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  return (
    <>
      {showQuickMenu && <QuickActionMenu onClose={() => setShowQuickMenu(false)} />}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-black border-t border-white/[0.06] safe-bottom">
        <div className="flex items-center h-16">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors",
                  isActive ? "text-white" : "text-olive"
                )}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-sans font-medium tracking-wide uppercase">{item.label}</span>
              </Link>
            )
          })}

          {/* FAB central */}
          <button
            onClick={() => setShowQuickMenu((v) => !v)}
            aria-label="Ajouter"
            className={cn(
              "flex items-center justify-center w-14 h-14 mx-2 transition-all duration-200",
              showQuickMenu
                ? "bg-kaki rotate-45"
                : "bg-white hover:bg-beige active:scale-95"
            )}
          >
            <Plus size={24} className={showQuickMenu ? "text-white" : "text-black"} />
          </button>

          {navItems.slice(2).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors",
                  isActive ? "text-white" : "text-olive"
                )}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-sans font-medium tracking-wide uppercase">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
