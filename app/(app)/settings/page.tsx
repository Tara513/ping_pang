'use client'

import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  User, Target, Wrench, Eye, GraduationCap, Bell,
  Link2, LogOut, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

const SECTIONS = [
  {
    label: 'Compte',
    items: [
      { href: '/profile/edit', icon: User, label: 'Modifier le profil' },
      { href: '/settings/goals', icon: Target, label: 'Objectifs hebdomadaires' },
      { href: '/equipment', icon: Wrench, label: 'Matériel' },
    ],
  },
  {
    label: 'Confidentialité',
    items: [
      { href: '/settings/privacy', icon: Eye, label: 'Confidentialité du profil' },
    ],
  },
  {
    label: 'Entraînement',
    items: [
      { href: '/settings/coach', icon: GraduationCap, label: 'Mode coach' },
      { href: '/settings/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    label: 'Connexions',
    items: [
      { href: '/settings/ranking', icon: Link2, label: 'Connecter Ranking App' },
    ],
  },
]

export default function SettingsPage() {
  const [coachMode, setCoachMode] = useState(true)
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="space-y-5">
      <h2 className="font-heading font-bold text-xl text-onyx">Paramètres</h2>

      {/* Quick toggles */}
      <Card>
        <CardTitle className="mb-3">Préférences</CardTitle>
        <div className="space-y-3">
          <ToggleRow
            icon={GraduationCap}
            label="Mode coach"
            description="Commentaires sur tes séances et matchs"
            checked={coachMode}
            onChange={setCoachMode}
          />
          <ToggleRow
            icon={Bell}
            label="Notifications"
            description="Rappels d'entraînement et analyses"
            checked={notifications}
            onChange={setNotifications}
          />
        </div>
      </Card>

      {/* Navigation sections */}
      {SECTIONS.map(section => (
        <div key={section.label}>
          <p className="text-xs font-semibold text-onyx-400 uppercase tracking-wide mb-2 px-1">{section.label}</p>
          <Card padding="none">
            {section.items.map(({ href, icon: Icon, label }, i) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 hover:bg-onyx-50 transition-colors',
                  i < section.items.length - 1 && 'border-b border-onyx-50',
                )}
              >
                <Icon size={16} className="text-onyx-400 shrink-0" />
                <span className="flex-1 text-sm text-onyx">{label}</span>
                <ChevronRight size={14} className="text-onyx-200" />
              </Link>
            ))}
          </Card>
        </div>
      ))}

      {/* Logout */}
      <Button variant="danger" fullWidth icon={LogOut}>
        Se déconnecter
      </Button>

      <p className="text-center text-xs text-onyx-300">Ping Pang Training v0.1.0</p>
    </div>
  )
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }: {
  icon: React.ElementType; label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="size-8 rounded-[6px] bg-onyx-50 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-onyx-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-onyx">{label}</p>
        <p className="text-xs text-onyx-400">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'w-10 h-6 rounded-full transition-colors relative shrink-0',
          checked ? 'bg-evergreen' : 'bg-onyx-200',
        )}
      >
        <span className={cn(
          'absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1',
        )} />
      </button>
    </div>
  )
}
