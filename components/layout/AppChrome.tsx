"use client"

import BottomNav from "@/components/layout/BottomNav"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"
import {
  Activity,
  BarChart3,
  Compass,
  Home,
  Map,
  Plus,
  Swords,
  Trophy,
  UserRound,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/elo", label: "ELO", icon: Activity },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/map", label: "Carte", icon: Map },
  { href: "/profile", label: "Profil", icon: UserRound },
]

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-dvh bg-ppp-bg text-ppp-text">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/8 bg-ppp-bg/86 p-4 backdrop-blur-xl lg:block">
        <Link href="/dashboard" className="mb-7 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ppp-forest text-black">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-[0.16em] text-ppp-text">Ping Pang</div>
            <div className="text-xs text-ppp-muted">Training cockpit</div>
          </div>
        </Link>

        <div className="mb-5 grid grid-cols-2 gap-2">
          <Button size="sm" className="px-2" onClick={() => undefined}>
            <Link href="/session/new" className="flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Séance
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="px-2">
            <Link href="/match/new" className="flex items-center gap-1.5">
              <Swords className="h-3.5 w-3.5" />
              Match
            </Link>
          </Button>
        </div>

        <nav className="space-y-1">
          {primaryNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-ppp-forest/14 text-ppp-forest"
                    : "text-ppp-muted hover:bg-white/5 hover:text-ppp-text"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-ppp-forest" />}
              </Link>
            )
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/8 bg-white/5 p-4">
          <Badge label="Objectif semaine" color="gold" />
          <div className="mt-3 text-2xl font-black text-ppp-text">5h</div>
          <div className="mt-1 text-xs text-ppp-muted">Garde le rythme, session après session.</div>
        </div>
      </aside>

      <div className="lg:pl-72">{children}</div>
      <BottomNav />
    </div>
  )
}
