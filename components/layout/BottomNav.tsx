'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { LayoutDashboard, Calendar, BarChart2, Trophy, Brain, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { href: '/sessions', icon: Calendar, label: 'Séances' },
  { href: '/stats', icon: BarChart2, label: 'Stats' },
  { href: '/matches', icon: Trophy, label: 'Matchs' },
  { href: '/coach', icon: Brain, label: 'Coach' },
  { href: '/profile', icon: User, label: 'Profil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-onyx-100">
      <div className="flex items-stretch h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0 transition-colors min-w-0',
                active ? 'text-evergreen' : 'text-onyx-400',
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span className={cn('text-[9px] leading-tight truncate max-w-full px-0.5', active ? 'font-bold' : 'font-medium')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* iOS safe area */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  )
}
