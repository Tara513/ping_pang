'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, Bell } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': '',
  '/sessions': 'Séances',
  '/sessions/new': 'Nouvelle séance',
  '/exercises': 'Exercices',
  '/matches': 'Matchs',
  '/matches/new': 'Nouveau match',
  '/stats': 'Statistiques',
  '/calendar': 'Calendrier',
  '/elo': 'ELO joueur',
  '/profile': 'Profil',
  '/profile/edit': 'Modifier',
  '/equipment': 'Matériel',
  '/badges': 'Badges',
  '/ai-reports': 'Bilans IA',
  '/programs': 'Programmes',
  '/chat': 'Assistant IA',
  '/social': 'Social',
  '/pros': 'Routines pros',
  '/locations': 'Lieux',
  '/settings': 'Paramètres',
}

function getTitle(pathname: string): string {
  if (pageTitles[pathname] !== undefined) return pageTitles[pathname]
  const base = '/' + pathname.split('/')[1]
  return pageTitles[base] ?? 'Ping Pang'
}

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const segments = pathname.split('/').filter(Boolean)
  const isDetail = segments.length >= 2
  const isDashboard = pathname === '/dashboard'
  const title = getTitle(pathname)

  if (isDashboard) {
    // Dashboard has its own custom header inside the page
    return null
  }

  return (
    <header className="sticky top-0 z-30 bg-pp-white border-b border-onyx-100 flex items-center px-4 h-14 shrink-0">
      {/* Back button */}
      {isDetail ? (
        <button onClick={() => router.back()} className="mr-2 -ml-1 p-1.5 rounded-full hover:bg-onyx-50">
          <ChevronLeft size={22} className="text-onyx" />
        </button>
      ) : (
        <div className="w-8" />
      )}

      {/* Title */}
      <h1 className="flex-1 text-center font-heading font-bold text-base text-onyx">{title}</h1>

      {/* Right action */}
      <button className="relative p-1.5 -mr-1 rounded-full hover:bg-onyx-50">
        <Bell size={20} className="text-onyx-400" />
        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-mauve" />
      </button>
    </header>
  )
}
