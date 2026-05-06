"use client"

export const dynamic = "force-dynamic"


import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Disc, Dumbbell, Swords, Target, Trophy, Coffee, type LucideIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/Toast"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Slider from "@/components/ui/Slider"
import type { SessionType } from "@/types/database"

const SESSION_TYPES: { value: SessionType; label: string; icon: LucideIcon; color: string }[] = [
  { value: "technique", label: "Technique", icon: Disc, color: "#4A5240" },
  { value: "physique", label: "Physique", icon: Dumbbell, color: "#8A9178" },
  { value: "match", label: "Match", icon: Swords, color: "#C8352A" },
  { value: "service", label: "Service", icon: Target, color: "#E8C840" },
  { value: "competition", label: "Compétition", icon: Trophy, color: "#E8C840" },
  { value: "chill", label: "Chill", icon: Coffee, color: "#2A2A2A" },
]

const EXERCISES_PRESETS = [
  "Coup droit croisé", "Coup droit longue ligne", "Revers croisé", "Revers longue ligne",
  "Bloc revers", "Bloc coup droit", "Flick revers", "Flip coup droit",
  "Service pendule", "Service bombe", "Service revers", "Variation longueur",
  "Smash", "Lobbing", "Contre-attaque", "Shadow", "Footwork", "Multiball",
  "Match entraînement", "Jeu libre",
]

const FEELING_LABELS = ["", "Mauvais", "Bof", "Neutre", "Bien", "Excellent"]

function SessionEndedModal({ onDescribe, onQuick, loading }: { onDescribe: () => void; onQuick: () => void; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
      >
        <div className="flex justify-center mb-4 text-olive">
          <Disc size={56} strokeWidth={1} />
        </div>
        <h2 className="font-display text-5xl text-white uppercase mb-2">Séance terminée !</h2>
        <p className="text-olive text-sm mb-8">Tu veux décrire ta séance ?</p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={onDescribe} size="lg" fullWidth>
            Décrire ma séance
          </Button>
          <Button onClick={onQuick} variant="outline" size="lg" fullWidth loading={loading}>
            Enregistrer sans description
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function NewSessionPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [mode, setMode] = useState<"choose-end" | "describe" | "quick" | null>(null)
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

  const toggleExercise = (ex: string) => {
    setSelectedExercises((prev) =>
      prev.includes(ex) ? prev.filter((e) => e !== ex) : [...prev, ex]
    )
  }

  const saveSession = async (withDescription: boolean) => {
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

  if (mode === "choose-end") {
    return (
      <SessionEndedModal
        onDescribe={() => { setMode("describe"); setStep(2) }}
        onQuick={() => saveSession(false)}
        loading={loading}
      />
    )
  }

  return (
    <>
      <TopBar title="Nouvelle séance" showBack />
      <PageWrapper>
        <AnimatePresence mode="wait">
          {(mode === null || mode === "describe") && step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 pt-4"
            >
              <div>
                <p className="text-xs font-semibold text-olive uppercase tracking-wider mb-3">Type de séance</p>
                <div className="grid grid-cols-2 gap-2">
                  {SESSION_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setSessionType(t.value)}
                      className={`flex items-center gap-3 p-4 border text-left transition-all ${
                        sessionType === t.value
                          ? "border-kaki text-white"
                          : "border-white/10 text-olive hover:border-white/30"
                      }`}
                      style={sessionType === t.value ? { borderColor: t.color, backgroundColor: `${t.color}20` } : {}}
                    >
                      <t.icon size={20} strokeWidth={1.5} />
                      <span className="font-semibold text-sm">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    label="Durée (min)"
                    type="number"
                    placeholder="90"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <Input
                label="Lieu (optionnel)"
                placeholder="Ping Pang Paris"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={() => setMode("choose-end")}
                  fullWidth
                  size="lg"
                  disabled={!sessionType || !duration}
                >
                  Terminer la séance
                </Button>
                <Button
                  onClick={() => { setMode("describe"); setStep(2) }}
                  variant="outline"
                  fullWidth
                  disabled={!sessionType || !duration}
                >
                  Décrire maintenant
                </Button>
              </div>
            </motion.div>
          )}

          {mode === "describe" && step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 pt-4"
            >
              <div>
                <h3 className="font-display text-2xl text-white uppercase mb-1">Exercices</h3>
                <p className="text-olive text-xs mb-4">Qu&apos;as-tu travaillé ?</p>
                <div className="flex flex-wrap gap-2">
                  {EXERCISES_PRESETS.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => toggleExercise(ex)}
                      className={`text-xs px-3 py-1.5 border font-medium transition-all ${
                        selectedExercises.includes(ex)
                          ? "bg-kaki border-kaki text-white"
                          : "border-white/20 text-olive hover:border-white/40"
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                label="Notes (optionnel)"
                placeholder="Points travaillés, progrès, remarques..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Retour</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Suivant</Button>
              </div>
            </motion.div>
          )}

          {mode === "describe" && step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 pt-4"
            >
              <div>
                <h3 className="font-display text-2xl text-white uppercase mb-1">Ressenti</h3>
                <p className="text-olive text-xs mb-4">Comment tu te sens ?</p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-olive uppercase tracking-wider">Ressenti général</p>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setFeeling(v)}
                      className={`flex-1 py-3 border transition-all flex flex-col items-center gap-1 ${
                        feeling === v ? "border-kaki bg-kaki/20 text-white" : "border-white/10 text-olive hover:border-white/30"
                      }`}
                      title={FEELING_LABELS[v]}
                    >
                      <span className="font-display text-2xl leading-none">{v}</span>
                      <span className="text-[9px] uppercase tracking-wide">{FEELING_LABELS[v]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Slider label="Fatigue" value={fatigue} onChange={setFatigue} minLabel="Frais" maxLabel="Épuisé" />
              <Slider label="Motivation" value={motivation} onChange={setMotivation} minLabel="Faible" maxLabel="Dans la zone" />
              <Slider label="Confiance" value={confidence} onChange={setConfidence} minLabel="En doute" maxLabel="Invincible" />

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Retour</Button>
                <Button
                  onClick={() => saveSession(true)}
                  loading={loading}
                  className="flex-1"
                >
                  Enregistrer
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageWrapper>
    </>
  )
}
