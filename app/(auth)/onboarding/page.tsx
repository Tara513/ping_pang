"use client"

export const dynamic = "force-dynamic"


import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sprout, Disc, Zap, Medal, Crown, Flame, Shield, Scale, Pen, Shuffle, TrendingUp, Smile, Trophy, Target, BookOpen, type LucideIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Slider from "@/components/ui/Slider"
import type { PlayStyle, DominantHand, PlayerLevel, Federation } from "@/types/database"
import { FEDERATION_META } from "@/lib/elo/calculator"

const TOTAL_STEPS = 5

const LEVELS: { value: PlayerLevel; label: string; icon: LucideIcon }[] = [
  { value: "beginner", label: "Débutant", icon: Sprout },
  { value: "intermediate", label: "Intermédiaire", icon: Disc },
  { value: "advanced", label: "Avancé", icon: Zap },
  { value: "competitive", label: "Compétiteur", icon: Medal },
  { value: "elite", label: "Elite", icon: Crown },
]

const PLAY_STYLES: { value: PlayStyle; label: string; icon: LucideIcon }[] = [
  { value: "attacker", label: "Attaquant", icon: Flame },
  { value: "defender", label: "Défenseur", icon: Shield },
  { value: "allround", label: "Polyvalent", icon: Scale },
  { value: "penhold", label: "Penholder", icon: Pen },
  { value: "other", label: "Autre", icon: Shuffle },
]

const FEDERATIONS = Object.keys(FEDERATION_META) as Federation[]

interface OnboardingData {
  full_name: string
  username: string
  city: string
  club: string
  country: string
  level: PlayerLevel | null
  play_style: PlayStyle | null
  dominant_hand: DominantHand | null
  blade: string
  rubber_fh: string
  rubber_bh: string
  thickness_fh: number
  thickness_bh: number
  skip_equipment: boolean
  federations: Federation[]
  federation_ratings: Record<string, number>
  target_hours: number
  main_goal: string
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1 px-4 py-3">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-0.5 transition-all duration-300 ${i < step ? "bg-white" : "bg-white/20"}`}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Partial<OnboardingData>>({
    country: "FR",
    target_hours: 5,
    federations: [],
    federation_ratings: {},
    dominant_hand: "right",
  })

  const update = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }))
  }

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  const prev = () => setStep((s) => Math.max(s - 1, 1))

  const finish = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("profiles").upsert({
        id: user.id,
        username: data.username || user.email?.split("@")[0] || "player",
        full_name: data.full_name,
        city: data.city,
        club: data.club,
        country: data.country || "FR",
        level: data.level,
        play_style: data.play_style,
        dominant_hand: data.dominant_hand,
        is_coach: false,
      })

      if (!data.skip_equipment && data.blade) {
        await supabase.from("equipment").insert({
          player_id: user.id,
          blade: data.blade,
          rubber_fh: data.rubber_fh,
          rubber_bh: data.rubber_bh,
          thickness_fh: data.thickness_fh,
          thickness_bh: data.thickness_bh,
          is_current: true,
          started_at: new Date().toISOString().split("T")[0],
        })
      }

      if (data.federations?.length) {
        for (const fed of data.federations) {
          await supabase.from("elo_ratings").upsert({
            player_id: user.id,
            federation: fed,
            elo: data.federation_ratings?.[fed] || 1500,
          })
        }
      }

      if (data.target_hours) {
        const monday = new Date()
        monday.setDate(monday.getDate() - monday.getDay() + 1)
        await supabase.from("weekly_goals").insert({
          player_id: user.id,
          week_start: monday.toISOString().split("T")[0],
          target_hours: data.target_hours,
        })
      }

      router.push("/dashboard")
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <ProgressBar step={step} />

      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-[10px] text-olive uppercase tracking-wider">
          Étape {step} sur {TOTAL_STEPS}
        </span>
        {step < TOTAL_STEPS && (
          <button onClick={next} className="text-xs text-olive hover:text-white transition-colors uppercase tracking-wide">
            Passer
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col px-4 pb-8"
        >
          {step === 1 && <Step1 data={data} update={update} />}
          {step === 2 && <Step2 data={data} update={update} />}
          {step === 3 && <Step3 data={data} update={update} />}
          {step === 4 && <Step4 data={data} update={update} />}
          {step === 5 && <Step5 data={data} update={update} />}
        </motion.div>
      </AnimatePresence>

      <div className="px-4 pb-8 flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={prev} className="flex-1">
            Retour
          </Button>
        )}
        <Button
          onClick={step === TOTAL_STEPS ? finish : next}
          loading={loading}
          className="flex-1"
        >
          {step === TOTAL_STEPS ? "Commencer" : "Suivant"}
        </Button>
      </div>
    </div>
  )
}

function Step1({ data, update }: { data: Partial<OnboardingData>; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-4xl text-white uppercase">Mon identité</h2>
        <p className="text-olive text-sm mt-1">Présentons-nous d&apos;abord</p>
      </div>
      <div className="flex flex-col gap-4">
        <Input
          label="Prénom & Nom"
          placeholder="Timo Boll"
          value={data.full_name || ""}
          onChange={(e) => update({ full_name: e.target.value })}
        />
        <Input
          label="Nom d'utilisateur"
          placeholder="@timoboll"
          value={data.username || ""}
          onChange={(e) => update({ username: e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase() })}
        />
        <Input
          label="Pays"
          placeholder="France"
          value={data.country || ""}
          onChange={(e) => update({ country: e.target.value })}
        />
        <Input
          label="Ville"
          placeholder="Paris"
          value={data.city || ""}
          onChange={(e) => update({ city: e.target.value })}
        />
        <Input
          label="Club"
          placeholder="Ping Pang Paris"
          value={data.club || ""}
          onChange={(e) => update({ club: e.target.value })}
        />
      </div>
    </div>
  )
}

function Step2({ data, update }: { data: Partial<OnboardingData>; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-4xl text-white uppercase">Mon niveau</h2>
        <p className="text-olive text-sm mt-1">Évalue honnêtement ton niveau</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-olive uppercase tracking-wider mb-3">Niveau de jeu</p>
        <div className="grid grid-cols-1 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => update({ level: l.value })}
              className={`flex items-center gap-4 p-4 border text-left transition-all ${
                data.level === l.value
                  ? "border-kaki bg-kaki/20 text-white"
                  : "border-white/10 text-olive hover:border-white/30"
              }`}
            >
              <l.icon size={20} strokeWidth={1.5} />
              <span className="font-sans font-semibold">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-olive uppercase tracking-wider mb-3">Style de jeu</p>
        <div className="grid grid-cols-2 gap-2">
          {PLAY_STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ play_style: s.value })}
              className={`flex items-center gap-2 p-3 border text-left transition-all ${
                data.play_style === s.value
                  ? "border-kaki bg-kaki/20 text-white"
                  : "border-white/10 text-olive hover:border-white/30"
              }`}
            >
              <s.icon size={16} strokeWidth={1.5} />
              <span className="font-sans text-sm font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-olive uppercase tracking-wider mb-3">Main dominante</p>
        <div className="flex gap-2">
          {(["right", "left"] as DominantHand[]).map((h) => (
            <button
              key={h}
              onClick={() => update({ dominant_hand: h })}
              className={`flex-1 py-3 border text-sm font-semibold uppercase transition-all ${
                data.dominant_hand === h
                  ? "border-kaki bg-kaki text-white"
                  : "border-white/10 text-olive hover:border-white/30"
              }`}
            >
              {h === "right" ? "Droite" : "Gauche"}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step3({ data, update }: { data: Partial<OnboardingData>; update: (p: Partial<OnboardingData>) => void }) {
  if (data.skip_equipment) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center flex-1 text-center">
        <div className="text-olive"><Disc size={52} strokeWidth={1} /></div>
        <h2 className="font-display text-3xl text-white uppercase">Matériel ignoré</h2>
        <p className="text-olive text-sm">Tu pourras renseigner ton matériel plus tard depuis ton profil.</p>
        <button onClick={() => update({ skip_equipment: false })} className="text-xs text-olive underline hover:text-white">
          Renseigner quand même
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-4xl text-white uppercase">Mon matériel</h2>
        <p className="text-olive text-sm mt-1">Ton équipement actuel</p>
      </div>
      <div className="flex flex-col gap-4">
        <Input
          label="Bois (Blade)"
          placeholder="ex: Butterfly Innerforce ALC"
          value={data.blade || ""}
          onChange={(e) => update({ blade: e.target.value })}
        />
        <div className="flex flex-col gap-2">
          <Input
            label="Revêtement coup droit"
            placeholder="ex: Tenergy 05"
            value={data.rubber_fh || ""}
            onChange={(e) => update({ rubber_fh: e.target.value })}
          />
          <Input
            label="Épaisseur FH (mm)"
            type="number"
            step="0.1"
            min="1.0"
            max="2.5"
            placeholder="2.1"
            value={data.thickness_fh || ""}
            onChange={(e) => update({ thickness_fh: parseFloat(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Input
            label="Revêtement revers"
            placeholder="ex: Tenergy 64"
            value={data.rubber_bh || ""}
            onChange={(e) => update({ rubber_bh: e.target.value })}
          />
          <Input
            label="Épaisseur BH (mm)"
            type="number"
            step="0.1"
            min="1.0"
            max="2.5"
            placeholder="1.9"
            value={data.thickness_bh || ""}
            onChange={(e) => update({ thickness_bh: parseFloat(e.target.value) })}
          />
        </div>
      </div>
      <button
        onClick={() => update({ skip_equipment: true })}
        className="text-xs text-olive hover:text-white transition-colors underline text-center"
      >
        Je ne sais pas encore → Passer cette étape
      </button>
    </div>
  )
}

function Step4({ data, update }: { data: Partial<OnboardingData>; update: (p: Partial<OnboardingData>) => void }) {
  const toggleFed = (fed: Federation) => {
    const current = data.federations || []
    if (current.includes(fed)) {
      update({ federations: current.filter((f) => f !== fed) })
    } else {
      update({ federations: [...current, fed] })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-4xl text-white uppercase">ELO & Fédérations</h2>
        <p className="text-olive text-sm mt-1">Sélectionne tes fédérations actives</p>
      </div>

      <div className="flex flex-col gap-2">
        {FEDERATIONS.map((fed) => {
          const meta = FEDERATION_META[fed]
          const isSelected = data.federations?.includes(fed)
          return (
            <div key={fed} className="flex flex-col gap-2">
              <button
                onClick={() => toggleFed(fed)}
                className={`flex items-center gap-4 p-4 border text-left transition-all ${
                  isSelected
                    ? "border-kaki bg-kaki/20 text-white"
                    : "border-white/10 text-olive hover:border-white/30"
                }`}
              >
                <span className="text-2xl">{meta.flag}</span>
                <div>
                  <div className="font-semibold text-sm">{meta.name}</div>
                  <div className="text-xs opacity-60">{meta.country}</div>
                </div>
                <div className={`ml-auto w-5 h-5 border flex items-center justify-center transition-all ${isSelected ? "bg-kaki border-kaki" : "border-white/30"}`}>
                  {isSelected && <span className="text-white text-xs">✓</span>}
                </div>
              </button>

              {isSelected && (
                <div className="pl-4">
                  <Input
                    label={`Classement ${meta.name} actuel`}
                    type="number"
                    placeholder="1500 (si inconnu)"
                    value={data.federation_ratings?.[fed] || ""}
                    onChange={(e) => update({
                      federation_ratings: {
                        ...(data.federation_ratings || {}),
                        [fed]: parseInt(e.target.value) || 1500,
                      }
                    })}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step5({ data, update }: { data: Partial<OnboardingData>; update: (p: Partial<OnboardingData>) => void }) {
  const GOALS: { value: string; label: string; icon: LucideIcon }[] = [
    { value: "progress", label: "Progresser", icon: TrendingUp },
    { value: "fun", label: "Me défouler", icon: Smile },
    { value: "competition", label: "Compétition", icon: Trophy },
    { value: "coaching", label: "Coaching", icon: Target },
    { value: "discovery", label: "Découverte", icon: BookOpen },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-4xl text-white uppercase">Mes objectifs</h2>
        <p className="text-olive text-sm mt-1">On personnalise ton expérience</p>
      </div>

      <Slider
        label="Heures par semaine"
        value={data.target_hours || 5}
        onChange={(v) => update({ target_hours: v })}
        min={1}
        max={20}
        minLabel="1h"
        maxLabel="20h"
      />

      <div>
        <p className="text-xs font-semibold text-olive uppercase tracking-wider mb-3">Objectif principal</p>
        <div className="grid grid-cols-1 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => update({ main_goal: g.value })}
              className={`flex items-center gap-4 p-4 border text-left transition-all ${
                data.main_goal === g.value
                  ? "border-kaki bg-kaki/20 text-white"
                  : "border-white/10 text-olive hover:border-white/30"
              }`}
            >
              <g.icon size={20} strokeWidth={1.5} />
              <span className="font-sans font-semibold">{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-kaki/10 border border-kaki/30 p-4 text-center">
        <p className="font-display text-2xl text-white uppercase mb-1">Prêt à tracker !</p>
        <p className="text-sm text-olive">Ton profil est configuré. Let&apos;s play.</p>
      </div>
    </div>
  )
}
