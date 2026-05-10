"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Slider from "@/components/ui/Slider"
import type { PlayStyle, DominantHand, PlayerLevel, Federation } from "@/types/database"
import { FEDERATION_META } from "@/lib/elo/calculator"
import { cn } from "@/lib/utils/cn"

const TOTAL_STEPS = 5

const LEVELS: { value: PlayerLevel; label: string; sub: string }[] = [
  { value: "beginner",     label: "Débutant",       sub: "Je découvre le jeu" },
  { value: "intermediate", label: "Intermédiaire",   sub: "Je joue régulièrement" },
  { value: "advanced",     label: "Avancé",          sub: "Bon niveau de club" },
  { value: "competitive",  label: "Compétiteur",     sub: "Je joue en championnat" },
  { value: "elite",        label: "Elite",           sub: "Niveau national ou plus" },
]

const PLAY_STYLES: { value: PlayStyle; label: string; sub: string }[] = [
  { value: "attacker",  label: "Attaquant",  sub: "Jeu offensif" },
  { value: "defender",  label: "Défenseur",  sub: "Jeu défensif" },
  { value: "allround",  label: "Polyvalent", sub: "Équilibré" },
  { value: "penhold",   label: "Penholder",  sub: "Prise porte-plume" },
  { value: "other",     label: "Autre",      sub: "Style libre" },
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
    <div className="flex gap-[3px] px-4 pt-4 pb-2 flex-shrink-0">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 h-[2px] transition-all duration-300",
            i < step ? "bg-white" : "bg-white/15"
          )}
        />
      ))}
    </div>
  )
}

function SelectionRow({
  selected,
  onClick,
  label,
  sub,
}: {
  selected: boolean
  onClick: () => void
  label: string
  sub?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center text-left py-4 border-b border-white/[0.05] transition-all",
        "border-l-2 pl-4",
        selected
          ? "border-l-green-light text-white"
          : "border-l-transparent text-sage hover:text-white hover:border-l-white/20"
      )}
    >
      <div className="flex-1">
        <div className="font-sans text-sm font-medium">{label}</div>
        {sub && <div className="text-[10px] text-sage/60 mt-0.5">{sub}</div>}
      </div>
      {selected && (
        <div className="w-1.5 h-1.5 bg-green-light flex-shrink-0 mr-2" />
      )}
    </button>
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
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <ProgressBar step={step} />

      {/* Step counter + skip */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <span className="text-[9px] text-sage uppercase tracking-[0.25em]">
          {step} / {TOTAL_STEPS}
        </span>
        {step < TOTAL_STEPS && (
          <button
            onClick={next}
            className="text-[10px] text-sage hover:text-white transition-colors uppercase tracking-[0.2em]"
          >
            Passer →
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col px-4 pb-6 pt-2"
          >
            {step === 1 && <Step1 data={data} update={update} />}
            {step === 2 && <Step2 data={data} update={update} />}
            {step === 3 && <Step3 data={data} update={update} />}
            {step === 4 && <Step4 data={data} update={update} />}
            {step === 5 && <Step5 data={data} update={update} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky bottom actions */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-white/[0.06] bg-black flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={prev} className="flex-1">
            Retour
          </Button>
        )}
        <Button
          onClick={step === TOTAL_STEPS ? finish : next}
          loading={loading}
          className="flex-1"
          size="lg"
        >
          {step === TOTAL_STEPS ? "Commencer" : "Suivant →"}
        </Button>
      </div>
    </div>
  )
}

function StepHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-4xl font-light text-white leading-tight">{title}</h2>
      {sub && <p className="text-sage text-xs mt-2 tracking-[0.05em]">{sub}</p>}
    </div>
  )
}

function Step1({ data, update }: { data: Partial<OnboardingData>; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeading title="Mon identité" sub="Présentons-nous d'abord" />
      <div className="flex flex-col gap-5">
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
      <StepHeading title="Mon niveau" sub="Évalue honnêtement ton niveau" />

      <div>
        <div className="text-[9px] text-sage uppercase tracking-[0.25em] mb-4">Niveau de jeu</div>
        {LEVELS.map((l) => (
          <SelectionRow
            key={l.value}
            selected={data.level === l.value}
            onClick={() => update({ level: l.value })}
            label={l.label}
            sub={l.sub}
          />
        ))}
      </div>

      <div>
        <div className="text-[9px] text-sage uppercase tracking-[0.25em] mb-4">Style de jeu</div>
        {PLAY_STYLES.map((s) => (
          <SelectionRow
            key={s.value}
            selected={data.play_style === s.value}
            onClick={() => update({ play_style: s.value })}
            label={s.label}
            sub={s.sub}
          />
        ))}
      </div>

      <div>
        <div className="text-[9px] text-sage uppercase tracking-[0.25em] mb-4">Main dominante</div>
        <div className="flex gap-0">
          {(["right", "left"] as DominantHand[]).map((h) => (
            <button
              key={h}
              onClick={() => update({ dominant_hand: h })}
              className={cn(
                "flex-1 py-4 border-b-2 text-xs uppercase tracking-[0.15em] transition-all font-sans",
                data.dominant_hand === h
                  ? "border-b-green-light text-white"
                  : "border-b-white/10 text-sage hover:text-white"
              )}
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
      <div className="flex flex-col gap-6 items-start justify-center py-8">
        <StepHeading title="Matériel ignoré" sub="Tu pourras renseigner ton matériel plus tard depuis ton profil." />
        <button
          onClick={() => update({ skip_equipment: false })}
          className="text-[10px] text-sage underline hover:text-white uppercase tracking-[0.15em] transition-colors"
        >
          Renseigner quand même →
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <StepHeading title="Mon matériel" sub="Ton équipement actuel" />
      <div className="flex flex-col gap-5">
        <Input
          label="Bois (Blade)"
          placeholder="Butterfly Innerforce ALC"
          value={data.blade || ""}
          onChange={(e) => update({ blade: e.target.value })}
        />
        <Input
          label="Revêtement coup droit"
          placeholder="Tenergy 05"
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
        <Input
          label="Revêtement revers"
          placeholder="Tenergy 64"
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
      <button
        onClick={() => update({ skip_equipment: true })}
        className="text-[10px] text-sage hover:text-white transition-colors underline text-center uppercase tracking-[0.1em]"
      >
        Passer cette étape →
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
      <StepHeading title="ELO & Fédérations" sub="Sélectionne tes fédérations actives" />

      <div>
        {FEDERATIONS.map((fed) => {
          const meta = FEDERATION_META[fed]
          const isSelected = data.federations?.includes(fed)
          return (
            <div key={fed}>
              <button
                onClick={() => toggleFed(fed)}
                className={cn(
                  "w-full flex items-center text-left py-4 border-b border-white/[0.05] transition-all",
                  "border-l-2 pl-4",
                  isSelected
                    ? "border-l-green-light text-white"
                    : "border-l-transparent text-sage hover:text-white"
                )}
              >
                <span className="text-xl mr-4">{meta.flag}</span>
                <div className="flex-1">
                  <div className="font-sans text-sm font-medium">{meta.name}</div>
                  <div className="text-[10px] text-sage/60">{meta.country}</div>
                </div>
                {isSelected && <div className="w-1.5 h-1.5 bg-green-light mr-2 flex-shrink-0" />}
              </button>

              {isSelected && (
                <div className="pl-4 pb-4 border-b border-white/[0.05]">
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
  const GOALS = [
    { value: "progress",    label: "Progresser",    sub: "Améliorer mon niveau" },
    { value: "fun",         label: "Me défouler",   sub: "Jouer pour le plaisir" },
    { value: "competition", label: "Compétition",   sub: "Performer en tournoi" },
    { value: "coaching",    label: "Coaching",      sub: "Progresser avec un coach" },
    { value: "discovery",   label: "Découverte",    sub: "Explorer le tennis de table" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <StepHeading title="Mes objectifs" sub="On personnalise ton expérience" />

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
        <div className="text-[9px] text-sage uppercase tracking-[0.25em] mb-4">Objectif principal</div>
        {GOALS.map((g) => (
          <SelectionRow
            key={g.value}
            selected={data.main_goal === g.value}
            onClick={() => update({ main_goal: g.value })}
            label={g.label}
            sub={g.sub}
          />
        ))}
      </div>

      <div className="border-l-[3px] border-green-light pl-4 py-4 mt-2">
        <div className="font-display text-2xl font-light text-white leading-tight">
          Prêt à tracker
        </div>
        <div className="text-xs text-sage mt-1">Ton profil est configuré.</div>
      </div>
    </div>
  )
}
