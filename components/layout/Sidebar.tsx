'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, Dumbbell, Book, Trophy, BarChart2,
  CalendarDays, TrendingUp, User, Wrench, Award, Brain,
  ListTodo, MessageSquare, Users, Star, MapPin, Settings,
} from 'lucide-react'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/sessions', icon: Dumbbell, label: 'Séances' },
      { href: '/exercises', icon: Book, label: 'Exercices' },
      { href: '/matches', icon: Trophy, label: 'Matchs' },
    ],
  },
  {
    label: 'Progression',
    items: [
      { href: '/stats', icon: BarChart2, label: 'Statistiques' },
      { href: '/calendar', icon: CalendarDays, label: 'Calendrier' },
      { href: '/elo', icon: TrendingUp, label: 'Classement ELO' },
    ],
  },
  {
    label: 'IA & Programmes',
    items: [
      { href: '/ai-reports', icon: Brain, label: 'Bilans IA' },
      { href: '/programs', icon: ListTodo, label: 'Programmes' },
      { href: '/chat', icon: MessageSquare, label: 'Chatbot IA' },
    ],
  },
  {
    label: 'Communauté',
    items: [
      { href: '/social', icon: Users, label: 'Social' },
      { href: '/pros', icon: Star, label: 'Routines pros' },
      { href: '/locations', icon: MapPin, label: 'Lieux' },
    ],
  },
  {
    label: 'Mon compte',
    items: [
      { href: '/profile', icon: User, label: 'Profil' },
      { href: '/equipment', icon: Wrench, label: 'Matériel' },
      { href: '/badges', icon: Award, label: 'Badges' },
      { href: '/settings', icon: Settings, label: 'Paramètres' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 border-r border-onyx-100 bg-white overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-onyx-100">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-[6px] bg-evergreen flex items-center justify-center">
            <span className="text-lime font-heading font-black text-sm">PP</span>
          </div>
          <div>
            <p className="font-heading font-bold text-onyx text-sm leading-tight">Ping Pang</p>
            <p className="text-[10px] text-onyx-400 leading-tight">Training</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-onyx-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 px-2 py-1.5 rounded-[6px] text-sm transition-colors',
                      active
                        ? 'bg-evergreen text-pp-white font-medium'
                        : 'text-onyx-600 hover:bg-onyx-50 hover:text-onyx',
                    )}
                  >
                    <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User snippet */}
      <div className="px-4 py-3 border-t border-onyx-100">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-evergreen flex items-center justify-center text-[10px] font-bold text-lime">
            LM
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-onyx truncate">Lucas Martin</p>
            <p className="text-[10px] text-onyx-400 truncate">@lucas.pp</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
