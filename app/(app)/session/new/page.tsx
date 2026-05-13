"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/Toast"
import TopBar from "@/components/layout/TopBar"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Slider from "@/components/ui/Slider"
import Textarea from "@/components/ui/Textarea"
import type { SessionType } from "@/types/database"

const SESSION_TYPES: { value: SessionType; label: string; sub: string }[] = [
  { value: "technique",    label: "Technique",    sub: "Travail des coups, placement" },
  { value: "physique",     label: "Physique",     sub: "Endurance, vitesse, explosivité" },
  { value: "match",        label: "Match",        sub: "Matchs d'entraînement" },
  { value: "service",      label: "Service",      sub: "Travail des services et retours" },
  { value: "competition",  label: "Compétition",  sub: "Tournoi ou championnat officiel" },
  { value: "chill",        label: "Chill",        sub: "Jeu libre et détente" },
]

const EXERCISES = [
  "Coup droit croisé", "Coup droit longue ligne", "Revers croisé", "Revers longue ligne",
  "Bloc revers", "Bloc coup droit", "Flick revers", "Flip coup droit",
  "Service pendule", "Service bombe", "Service revers", "Variation longueur",
  "Smash", "Lobbing", "Contre-attaque", "Shadow", "Footwork", "Multiball",
  "Match entraînement", "Jeu libre",
]

export default function NewSessionPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [sessionType, setSessionType] = useState<SessionType | null>(null)
  const [duration, setDuration] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [location, setLocation] = useState("")
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [feeling, setFeeling] = useState(3)
  const [fatigue, setFatigue] = useState(3)
  const [motivation, setMotivation] = useState(3)
  const [confidence, setConfidence] = useState(3)

  const toggleExercise = (ex: string) =>
    setSelectedExercises((prev) => prev.includes(ex) ? prev.filter((e) => e !== ex) : [...prev, ex])

  const save = async (withDescription: boolean) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from("sessions").insert({
        player_id: user.id,
        session_type: sessionType || "technique",
        duration_min: parseInt(duration) || 60,
        date,
        location: location || null,
        notes: notes || null,
        exercises: selectedExercises.map((name) => ({ name })),
        feeling: withDescription ? feeling : null,
        fatigue: withDescription ? fatigue : null,
        motivation: withDescription ? motivation : null,
        confidence: withDescription ? confidence : null,
        has_description: withDescription,
      })
      toast("Séance enregistrée !", "success")
      router.push("/dashboard")
    } catch {
      toast("Erreur lors de l'enregistrement", "error")
    } finally {
      setLoading(false)
    }
  }

  const canNext1 = sessionType && duration

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <TopBar title={step === 1 ? "Séance" : step === 2 ? "Exercices" : "Ressenti"} showBack />

      {/* Progress bar */}
      <div className="flex h-[2px]">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex-1 transition-all duration-500 ${i <= step ? "bg-white" : "bg-white/10"}`} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-4 pt-8 pb-6">
                <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-2">Type de séance</div>
                <div className="font-display font-light text-white leading-tight" style={{ fontSize: 40 }}>
                  Qu&apos;as-tu<br />pratiqué ?
                </div>
              </div>

              <div>
                {SESSION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setSessionType(t.value)}
                    className={`w-full flex items-center gap-4 px-4 py-4 border-b border-white/[0.05] text-left transition-all ${
                      sessionType === t.value ? "bg-surface" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className={`w-[3px] self-stretch flex-shrink-0 transition-colors ${
                      sessionType === t.value ? "bg-green-light" : "bg-white/10"
                    }`} />
                    <div className="flex-1">
                      <div className={`font-display text-2xl font-light transition-colors ${
                        sessionType === t.value ? "text-white" : "text-white/40"
                      }`}>{t.label}</div>
                      <div className="text-[10px] text-sage mt-0.5">{t.sub}</div>
                    </div>
                    {sessionType === t.value && (
                      <div className="text-[9px] text-green-light uppercase tracking-widest">✓</div>
                    )}
                  </button>
                ))}
              </div>

              <div className="px-4 pt-7 pb-4 flex flex-col gap-6">
                <div className="flex gap-5">
                  <div className="flex-1">
                    <Input label="Durée (min)" type="number" placeholder="90" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>
                <Input label="Lieu (optionnel)" placeholder="Salle Centrale..." value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-4 pt-8 pb-6">
                <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-2">Exercices</div>
                <div className="font-display font-light text-white leading-tight" style={{ fontSize: 40 }}>
                  Qu&apos;as-tu<br />travaillé ?
                </div>
              </div>
              <div className="px-4 flex flex-wrap gap-2 pb-4">
                {EXERCISES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => toggleExercise(ex)}
                    className={`text-[11px] px-3 py-1.5 border font-sans uppercase tracking-[0.08em] transition-all ${
                      selectedExercises.includes(ex)
                        ? "border-white text-white bg-surface"
                        : "border-white/15 text-sage hover:border-white/30"
                    }`}
                  >
                    {selectedExercises.includes(ex) ? "✓ " : ""}{ex}
                  </button>
                ))}
              </div>
              <div className="px-4 pb-6">
                <Textarea
                  label="Notes (optionnel)"
                  placeholder="Points travaillés, progrès, remarques..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-4 pt-8 pb-6">
                <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-2">Ressenti</div>
                <div className="font-display font-light text-white leading-tight" style={{ fontSize: 40 }}>
                  Comment<br />tu te sens ?
                </div>
              </div>

              <div className="px-4 mb-7">
                <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-3">Ressenti général</div>
                <div className="flex gap-2">
                  {["😤", "😕", "😐", "😊", "🤩"].map((emoji, idx) => {
                    const v = idx + 1
                    return (
                      <button
                        key={v}
                        onClick={() => setFeeling(v)}
                        className={`flex-1 py-5 text-2xl border transition-all ${
                          feeling === v ? "border-white bg-surface" : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        {emoji}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="px-4 flex flex-col gap-7 pb-4">
                <Slider label="Fatigue" value={fatigue} onChange={setFatigue} minLabel="Frais" maxLabel="Épuisé" />
                <Slider label="Motivation" value={motivation} onChange={setMotivation} minLabel="Faible" maxLabel="Dans la zone" />
                <Slider label="Confiance" value={confidence} onChange={setConfidence} minLabel="En doute" maxLabel="Invincible" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-white/[0.06] bg-black flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-shrink-0 px-4 text-sage hover:text-white transition-colors font-sans text-sm"
          >
            ←
          </button>
        )}
        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)} fullWidth size="lg" disabled={step === 1 && !canNext1}>
            Suivant →
          </Button>
        ) : (
          <div className="flex gap-3 flex-1">
            <Button variant="outline" onClick={() => save(false)} loading={loading} className="flex-1" size="lg">
              Enregistrer
            </Button>
            <Button onClick={() => save(true)} loading={loading} className="flex-1" size="lg">
              Avec ressenti
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
