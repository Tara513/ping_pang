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

function QuickActionMenu({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-ppp-text/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 items-center w-full max-w-[480px] px-8"
      >
        <Link
          href="/session/new"
          onClick={onClose}
          className="bg-ppp-forest text-ppp-white px-8 py-3.5 font-serif text-sm tracking-[0.08em] uppercase flex items-center gap-3 w-full justify-center transition-all hover:bg-ppp-forest-dark active:scale-[0.98] shadow-lg"
        >
          <span>🏓</span> Logger une séance
        </Link>
        <Link
          href="/match/new"
          onClick={onClose}
          className="bg-ppp-white text-ppp-text border border-ppp-border px-8 py-3.5 font-serif text-sm tracking-[0.08em] uppercase flex items-center gap-3 w-full justify-center transition-all hover:border-ppp-text active:scale-[0.98] shadow-lg"
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

      {/* Nav fixée en bas, contenu centré dans max-w-[480px] */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-ppp-white border-t border-ppp-border safe-bottom">
        <div className="flex items-center h-16 max-w-[480px] mx-auto px-2">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors duration-150",
                  isActive ? "text-ppp-forest" : "text-ppp-muted"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[0.6rem] font-serif uppercase tracking-[0.06em]">{item.label}</span>
              </Link>
            )
          })}

          {/* FAB central */}
          <button
            onClick={() => setShowQuickMenu((v) => !v)}
            aria-label="Ajouter"
            className={cn(
              "flex items-center justify-center mx-4 rounded-full transition-all duration-200 shadow-md",
              showQuickMenu
                ? "bg-ppp-forest-dark rotate-45 scale-95"
                : "bg-ppp-forest hover:bg-ppp-forest-dark active:scale-90"
            )}
            style={{ width: 52, height: 52 }}
          >
            <Plus size={22} className="text-ppp-white" />
          </button>

          {navItems.slice(2).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors duration-150",
                  isActive ? "text-ppp-forest" : "text-ppp-muted"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[0.6rem] font-serif uppercase tracking-[0.06em]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
