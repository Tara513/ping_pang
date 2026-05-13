'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils/cn'
import {
  User, MapPin, Activity, Hand, Wrench, Target,
  ChevronRight, ChevronLeft, Check, GraduationCap,
} from 'lucide-react'
import type { Level, PlayingStyle, DominantHand, RubberThickness } from '@/lib/types'

const STEPS = 8
const LEVELS: { value: Level; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Débutant', desc: 'Je commence le tennis de table' },
  { value: 'intermediate', label: 'Intermédiaire', desc: 'Je maîtrise les bases, je joue en club' },
  { value: 'advanced', label: 'Avancé', desc: 'Je suis compétiteur régulier' },
  { value: 'expert', label: 'Expert', desc: 'Classé FFTT 1000+, compétition nationale' },
  { value: 'pro', label: 'Pro', desc: 'Joueur professionnel ou semi-pro' },
]

const STYLES: { value: PlayingStyle; label: string; desc: string }[] = [
  { value: 'attacker', label: 'Attaquant', desc: 'Top spin dominant, jeu offensif' },
  { value: 'all-round', label: 'Polyvalent', desc: 'Équilibre attaque-défense' },
  { value: 'defender', label: 'Défenseur', desc: 'Jeu à distance, anti-spin' },
  { value: 'blocker', label: 'Bloqueur', desc: 'Contre-attaque par le bloc' },
  { value: 'offensive-defender', label: 'Défenseur offensif', desc: 'Défense avec contre-attaques' },
]

const THICKNESS_OPTIONS: { value: RubberThickness; label: string }[] = [
  { value: '1.5', label: '1.5mm' },
  { value: '1.8', label: '1.8mm' },
  { value: '2.0', label: '2.0mm' },
  { value: '2.1', label: '2.1mm' },
  { value: 'max', label: 'Max' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [profile, setProfile] = useState({
    name: '', username: '', country: 'France', city: '', club: '',
    level: '' as Level,
    playing_style: '' as PlayingStyle,
    dominant_hand: '' as DominantHand,
    coach_mode: false,
    blade_brand: '', blade_model: '',
    fd_rubber_brand: '', fd_rubber_model: '', fd_thickness: 'max' as RubberThickness,
    bh_rubber_brand: '', bh_rubber_model: '', bh_thickness: '2.1' as RubberThickness,
    sessions_per_week: 3, hours_per_week: 5, matches_per_week: 1,
  })

  const next = () => setStep(s => Math.min(STEPS, s + 1))
  const prev = () => setStep(s => Math.max(1, s - 1))

  const finish = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    router.push('/dashboard')
  }

  const progress = ((step - 1) / (STEPS - 1)) * 100

  return (
    <div className="min-h-screen bg-pp-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="size-8 rounded-[6px] bg-evergreen flex items-center justify-center">
            <span className="text-lime font-heading font-black text-sm">PP</span>
          </div>
          <span className="font-heading font-bold text-onyx">Ping Pang</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-onyx-100 rounded-full mb-1">
          <div
            className="h-full bg-evergreen rounded-full transition-all duration-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-onyx-400">Étape {step} sur {STEPS}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 max-w-md mx-auto w-full">
        {step === 1 && (
          <StepShell icon={User} title="Ton profil" subtitle="Comment tu t'appelles ?">
            <Input label="Prénom et nom" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Lucas Martin" />
            <Input label="Nom d'utilisateur" value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} placeholder="lucas.pp" />
            <Select
              label="Pays"
              value={profile.country}
              onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}
              options={[{ value: 'France', label: 'France' }, { value: 'Belgique', label: 'Belgique' }, { value: 'Suisse', label: 'Suisse' }, { value: 'Luxembourg', label: 'Luxembourg' }]}
            />
            <Input label="Ville" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="Paris" />
            <Input label="Club (optionnel)" value={profile.club} onChange={e => setProfile(p => ({ ...p, club: e.target.value }))} placeholder="Racing Club de France TT" />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell icon={Activity} title="Ton niveau" subtitle="Où en es-tu dans ta progression ?">
            <div className="space-y-2">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setProfile(p => ({ ...p, level: l.value }))}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-[8px] border transition-all',
                    profile.level === l.value
                      ? 'border-evergreen bg-evergreen text-pp-white'
                      : 'border-onyx-200 bg-white hover:border-onyx-400',
                  )}
                >
                  <p className="font-semibold text-sm">{l.label}</p>
                  <p className={cn('text-xs mt-0.5', profile.level === l.value ? 'text-lime/80' : 'text-onyx-400')}>{l.desc}</p>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell icon={Activity} title="Style de jeu" subtitle="Comment tu joues naturellement ?">
            <div className="space-y-2">
              {STYLES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setProfile(p => ({ ...p, playing_style: s.value }))}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-[8px] border transition-all',
                    profile.playing_style === s.value
                      ? 'border-evergreen bg-evergreen text-pp-white'
                      : 'border-onyx-200 bg-white hover:border-onyx-400',
                  )}
                >
                  <p className="font-semibold text-sm">{s.label}</p>
                  <p className={cn('text-xs mt-0.5', profile.playing_style === s.value ? 'text-lime/80' : 'text-onyx-400')}>{s.desc}</p>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell icon={Hand} title="Main dominante" subtitle="Tu joues de quelle main ?">
            <div className="grid grid-cols-2 gap-3">
              {(['right', 'left'] as DominantHand[]).map(hand => (
                <button
                  key={hand}
                  onClick={() => setProfile(p => ({ ...p, dominant_hand: hand }))}
                  className={cn(
                    'py-8 rounded-[8px] border font-semibold text-sm transition-all',
                    profile.dominant_hand === hand
                      ? 'border-evergreen bg-evergreen text-pp-white'
                      : 'border-onyx-200 bg-white hover:border-onyx-400',
                  )}
                >
                  {hand === 'right' ? 'Droitier' : 'Gaucher'}
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell icon={Wrench} title="Ton matériel" subtitle="Bois et revêtements actuels">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-onyx-400 uppercase tracking-wide mb-2">Bois</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Marque" value={profile.blade_brand} onChange={e => setProfile(p => ({ ...p, blade_brand: e.target.value }))} />
                  <Input placeholder="Modèle" value={profile.blade_model} onChange={e => setProfile(p => ({ ...p, blade_model: e.target.value }))} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-onyx-400 uppercase tracking-wide mb-2">Revêtement coup droit</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input placeholder="Marque" value={profile.fd_rubber_brand} onChange={e => setProfile(p => ({ ...p, fd_rubber_brand: e.target.value }))} />
                  <Input placeholder="Modèle" value={profile.fd_rubber_model} onChange={e => setProfile(p => ({ ...p, fd_rubber_model: e.target.value }))} />
                </div>
                <Select
                  placeholder="Épaisseur CD"
                  value={profile.fd_thickness}
                  onChange={e => setProfile(p => ({ ...p, fd_thickness: e.target.value as RubberThickness }))}
                  options={THICKNESS_OPTIONS}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-onyx-400 uppercase tracking-wide mb-2">Revêtement revers</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input placeholder="Marque" value={profile.bh_rubber_brand} onChange={e => setProfile(p => ({ ...p, bh_rubber_brand: e.target.value }))} />
                  <Input placeholder="Modèle" value={profile.bh_rubber_model} onChange={e => setProfile(p => ({ ...p, bh_rubber_model: e.target.value }))} />
                </div>
                <Select
                  placeholder="Épaisseur RV"
                  value={profile.bh_thickness}
                  onChange={e => setProfile(p => ({ ...p, bh_thickness: e.target.value as RubberThickness }))}
                  options={THICKNESS_OPTIONS}
                />
              </div>
            </div>
          </StepShell>
        )}

        {step === 6 && (
          <StepShell icon={Target} title="Objectifs hebdo" subtitle="Combien tu veux t'entraîner par semaine ?">
            <div className="space-y-6">
              <GoalStepper
                label="Séances par semaine"
                value={profile.sessions_per_week}
                min={1} max={14}
                onChange={v => setProfile(p => ({ ...p, sessions_per_week: v }))}
              />
              <GoalStepper
                label="Heures par semaine"
                value={profile.hours_per_week}
                min={1} max={40}
                onChange={v => setProfile(p => ({ ...p, hours_per_week: v }))}
              />
              <GoalStepper
                label="Matchs par semaine"
                value={profile.matches_per_week}
                min={0} max={10}
                onChange={v => setProfile(p => ({ ...p, matches_per_week: v }))}
              />
            </div>
          </StepShell>
        )}

        {step === 7 && (
          <StepShell icon={GraduationCap} title="Mode coach" subtitle="Active le suivi coach pour bénéficier de commentaires sur tes séances et matchs.">
            <div className="space-y-3">
              {[true, false].map(mode => (
                <button
                  key={String(mode)}
                  onClick={() => setProfile(p => ({ ...p, coach_mode: mode }))}
                  className={cn(
                    'w-full text-left px-4 py-4 rounded-[8px] border transition-all',
                    profile.coach_mode === mode
                      ? 'border-evergreen bg-evergreen text-pp-white'
                      : 'border-onyx-200 bg-white hover:border-onyx-400',
                  )}
                >
                  <p className="font-semibold text-sm">{mode ? 'Mode coach activé' : 'Sans mode coach'}</p>
                  <p className={cn('text-xs mt-1', profile.coach_mode === mode ? 'text-lime/80' : 'text-onyx-400')}>
                    {mode
                      ? 'Commentaires sur chaque séance, analyse IA enrichie, recommandations personnalisées'
                      : 'Entraînement libre sans coaching intégré'}
                  </p>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 8 && (
          <StepShell icon={Check} title="C'est parti !" subtitle="Ton profil est prêt. Commence à enregistrer tes séances et matchs.">
            <div className="rounded-[8px] border border-onyx-100 bg-white p-4 space-y-2">
              <Row label="Nom" value={profile.name || '—'} />
              <Row label="Ville" value={profile.city || '—'} />
              <Row label="Niveau" value={profile.level || '—'} />
              <Row label="Style" value={profile.playing_style || '—'} />
              <Row label="Main" value={profile.dominant_hand === 'right' ? 'Droitier' : profile.dominant_hand === 'left' ? 'Gaucher' : '—'} />
              <Row label="Objectif" value={`${profile.sessions_per_week} séances / semaine`} />
              <Row label="Mode coach" value={profile.coach_mode ? 'Activé' : 'Désactivé'} />
            </div>
          </StepShell>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 pb-8 pt-4 max-w-md mx-auto w-full flex gap-3">
        {step > 1 && (
          <Button variant="outline" icon={ChevronLeft} onClick={prev} className="flex-1">
            Retour
          </Button>
        )}
        {step < STEPS ? (
          <Button variant="primary" iconRight={ChevronRight} onClick={next} className="flex-1">
            Continuer
          </Button>
        ) : (
          <Button variant="secondary" icon={Check} loading={loading} onClick={finish} className="flex-1">
            Commencer
          </Button>
        )}
      </div>
    </div>
  )
}

function StepShell({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType; title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="pt-4 pb-8">
      <div className="mb-6">
        <div className="size-12 rounded-full bg-evergreen/10 flex items-center justify-center mb-4">
          <Icon size={22} className="text-evergreen" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-onyx mb-1">{title}</h2>
        <p className="text-sm text-onyx-400">{subtitle}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function GoalStepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-onyx">{label}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="size-8 rounded-full border border-onyx-200 flex items-center justify-center text-onyx hover:bg-onyx-50"
        >
          −
        </button>
        <span className="font-heading font-bold text-xl text-onyx w-6 text-center tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="size-8 rounded-full border border-onyx-200 flex items-center justify-center text-onyx hover:bg-onyx-50"
        >
          +
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-onyx-50 last:border-0">
      <span className="text-sm text-onyx-400">{label}</span>
      <span className="text-sm font-medium text-onyx">{value}</span>
    </div>
  )
}
