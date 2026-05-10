"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, Map, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/dashboard", icon: Home,      label: "Feed"   },
  { href: "/stats",     icon: BarChart2,  label: "Stats"  },
  { href: "/map",       icon: Map,        label: "Carte"  },
  { href: "/profile",   icon: User,       label: "Profil" },
]

function QuickActionMenu({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="fixed bottom-20 left-0 right-0 z-50 flex flex-col gap-3 px-5 max-w-sm mx-auto"
      >
        <Link
          href="/session/new"
          onClick={onClose}
          className="bg-ppp-forest text-white py-4 font-serif text-sm tracking-[0.08em] uppercase flex items-center justify-center gap-3 rounded-2xl shadow-xl hover:bg-ppp-forest-dark active:scale-[0.98] transition-all"
        >
          🏓 Logger une séance
        </Link>
        <Link
          href="/match/new"
          onClick={onClose}
          className="bg-white text-ppp-text border border-gray-200 py-4 font-serif text-sm tracking-[0.08em] uppercase flex items-center justify-center gap-3 rounded-2xl shadow-xl hover:border-ppp-forest active:scale-[0.98] transition-all"
        >
          ⚔️ Logger un match
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

      {/* Nav fixée en bas, pleine largeur, propre */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center h-16 max-w-2xl mx-auto px-2">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors",
                  isActive ? "text-ppp-forest" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[0.6rem] font-serif uppercase tracking-[0.06em]">{item.label}</span>
              </Link>
            )
          })}

          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setShowQuickMenu(v => !v)}
              aria-label="Ajouter"
              style={{ width: 52, height: 52 }}
              className={cn(
                "flex items-center justify-center rounded-full shadow-lg transition-all duration-200",
                showQuickMenu ? "bg-ppp-forest-dark" : "bg-ppp-forest hover:bg-ppp-forest-dark active:scale-95"
              )}
            >
              <motion.div animate={{ rotate: showQuickMenu ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <Plus size={22} className="text-white" />
              </motion.div>
            </button>
          </div>

          {navItems.slice(2).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors",
                  isActive ? "text-ppp-forest" : "text-gray-400 hover:text-gray-600"
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
