'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardTitle } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Check } from 'lucide-react'
import type { UserProfile, Level, PlayingStyle, DominantHand } from '@/lib/types'
import { getUser, updateUser } from '@/lib/api'
import { LEVEL_LABELS, STYLE_LABELS } from '@/lib/utils/format'

export default function ProfileEditPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '', username: '', city: '', club: '', country: '',
    level: '' as Level,
    playing_style: '' as PlayingStyle,
    dominant_hand: '' as DominantHand,
  })

  useEffect(() => {
    getUser().then(u => {
      setUser(u)
      setForm({
        name: u.name, username: u.username, city: u.city,
        club: u.club ?? '', country: u.country,
        level: u.level, playing_style: u.playing_style, dominant_hand: u.dominant_hand,
      })
      setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    await updateUser(form)
    router.push('/profile')
  }

  if (loading) return <PageLoader />

  const levels: { value: Level; label: string }[] = Object.entries(LEVEL_LABELS).map(([value, label]) => ({ value: value as Level, label }))
  const styles: { value: PlayingStyle; label: string }[] = Object.entries(STYLE_LABELS).map(([value, label]) => ({ value: value as PlayingStyle, label }))

  return (
    <div className="space-y-5">
      <h2 className="font-heading font-bold text-xl text-onyx">Modifier le profil</h2>

      <Card>
        <CardTitle className="mb-4">Informations</CardTitle>
        <div className="space-y-4">
          <Input label="Nom complet" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Nom d'utilisateur" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          <Input label="Ville" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          <Input label="Club" value={form.club} onChange={e => setForm(f => ({ ...f, club: e.target.value }))} />
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Jeu</CardTitle>
        <div className="space-y-4">
          <Select
            label="Niveau"
            value={form.level}
            onChange={e => setForm(f => ({ ...f, level: e.target.value as Level }))}
            options={levels}
          />
          <Select
            label="Style de jeu"
            value={form.playing_style}
            onChange={e => setForm(f => ({ ...f, playing_style: e.target.value as PlayingStyle }))}
            options={styles}
          />
          <div>
            <p className="text-sm font-medium text-onyx-600 mb-2">Main dominante</p>
            <div className="grid grid-cols-2 gap-2">
              {(['right', 'left'] as DominantHand[]).map(hand => (
                <button
                  key={hand}
                  onClick={() => setForm(f => ({ ...f, dominant_hand: hand }))}
                  className={`py-2.5 rounded-[8px] border text-sm font-medium transition-all ${
                    form.dominant_hand === hand ? 'border-evergreen bg-evergreen text-pp-white' : 'border-onyx-200 bg-white'
                  }`}
                >
                  {hand === 'right' ? 'Droitier' : 'Gaucher'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Button variant="primary" icon={Check} fullWidth loading={saving} onClick={save}>
        Sauvegarder
      </Button>
    </div>
  )
}
