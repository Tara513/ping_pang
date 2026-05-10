"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, Map, User, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/dashboard", icon: Home,     label: "Feed"   },
  { href: "/stats",     icon: BarChart2, label: "Stats"  },
  { href: "/map",       icon: Map,       label: "Carte"  },
  { href: "/profile",   icon: User,      label: "Profil" },
]

const quickActions = [
  { href: "/session/new", label: "Logger une séance",  accent: "border-green-light" },
  { href: "/match/new",   label: "Logger un match",    accent: "border-sage" },
  { href: "/calendar",    label: "Calendrier",         accent: "border-white/30" },
  { href: "/program",     label: "Mon programme",      accent: "border-white/30" },
]

interface QuickActionMenuProps {
  onClose: () => void
}

function QuickActionMenu({ onClose }: QuickActionMenuProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/85"
        onClick={onClose}
      />
      <motion.div
        key="menu"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.18 }}
        className="fixed bottom-20 left-0 right-0 z-50 px-4 flex flex-col gap-0"
      >
        {quickActions.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={action.href}
              onClick={onClose}
              className={cn(
                "flex items-center bg-surface border-l-4 text-white px-6 py-4",
                "font-sans text-sm uppercase tracking-[0.15em]",
                "border-b border-white/[0.04] hover:bg-surface/80 transition-colors",
                action.accent
              )}
            >
              {action.label}
            </Link>
          </motion.div>
        ))}
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
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors relative",
                  isActive
                    ? "text-white border-t-2 border-white -mt-px"
                    : "text-sage/50"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[9px] font-sans uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          })}

          {/* Central FAB */}
          <button
            onClick={() => setShowQuickMenu((v) => !v)}
            aria-label="Ajouter"
            className={cn(
              "flex items-center justify-center w-12 h-12 mx-3 flex-shrink-0 transition-all duration-200",
              showQuickMenu ? "bg-surface" : "bg-green-light"
            )}
          >
            {showQuickMenu
              ? <X size={20} className="text-white" />
              : <Plus size={20} className="text-white" />
            }
          </button>

          {navItems.slice(2).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors relative",
                  isActive
                    ? "text-white border-t-2 border-white -mt-px"
                    : "text-sage/50"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[9px] font-sans uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
