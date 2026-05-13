"use client"

import Button from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"
import { AnimatePresence, motion } from "framer-motion"
import { BarChart3, Home, Map, Plus, Swords, Trophy, UserRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
  { href: "/map", icon: Map, label: "Carte" },
  { href: "/profile", icon: UserRound, label: "Profil" },
]

function QuickActions({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.button
        type="button"
        aria-label="Fermer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        className="fixed inset-x-4 bottom-24 z-50 mx-auto grid max-w-sm grid-cols-1 gap-2 lg:hidden"
      >
        <Button fullWidth className="justify-start" onClick={onClose}>
          <Link href="/session/new" className="flex w-full items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle séance
          </Link>
        </Button>
        <Button variant="outline" fullWidth className="justify-start" onClick={onClose}>
          <Link href="/match/new" className="flex w-full items-center justify-center gap-2">
            <Swords className="h-4 w-4" />
            Nouveau match
          </Link>
        </Button>
      </motion.div>
    </AnimatePresence>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && <QuickActions onClose={() => setOpen(false)} />}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-ppp-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-18 max-w-lg items-center px-2">
          {navItems.slice(0, 2).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold transition",
                  active ? "text-ppp-forest" : "text-ppp-muted hover:text-ppp-text"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
          <div className="flex flex-1 justify-center">
            <button
              onClick={() => setOpen((value) => !value)}
              className="focus-ring flex h-13 w-13 items-center justify-center rounded-full bg-ppp-forest text-black shadow-[0_16px_40px_rgba(39,179,106,0.32)] transition active:scale-95"
              aria-label="Ajouter"
            >
              <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.18 }}>
                <Plus className="h-6 w-6" />
              </motion.span>
            </button>
          </div>
          {navItems.slice(2).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold transition",
                  active ? "text-ppp-forest" : "text-ppp-muted hover:text-ppp-text"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
