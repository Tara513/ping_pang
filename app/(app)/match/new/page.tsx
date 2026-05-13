"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2 } from "lucide-react"
import { createPersonalMatch } from "@/lib/actions/training"
import { useToast } from "@/components/ui/Toast"
import TopBar from "@/components/layout/TopBar"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import type { MatchType } from "@/types/database"

const MATCH_TYPES: { value: MatchType; label: string; sub: string }[] = [
  { value: "friendly",    label: "Amical",        sub: "Match informel entre joueurs" },
  { value: "league",      label: "Championnat",   sub: "Rencontre officielle de ligue" },
  { value: "tournament",  label: "Tournoi",       sub: "Compétition avec classement" },
  { value: "training",    label: "Entraînement",  sub: "Match dans le cadre d'un training" },
]

interface SetScore { player: string; opponent: string }

export default function NewMatchPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [opponentName, setOpponentName] = useState("")
  const [matchType, setMatchType] = useState<MatchType>("friendly")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [location, setLocation] = useState("")
  const [sets, setSets] = useState<SetScore[]>([{ player: "", opponent: "" }])
  const [notes, setNotes] = useState("")

  const addSet = () => setSets((prev) => [...prev, { player: "", opponent: "" }])
  const removeSet = (i: number) => setSets((prev) => prev.filter((_, idx) => idx !== i))
  const updateSet = (i: number, field: "player" | "opponent", val: string) =>
    setSets((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  const setsWon = sets.filter((s) => parseInt(s.player) > parseInt(s.opponent)).length
  const setsLost = sets.filter((s) => parseInt(s.opponent) > parseInt(s.player)).length
  const filledSets = sets.filter((s) => s.player !== "" && s.opponent !== "")
  const isLeading = setsWon > setsLost
  const hasResult = filledSets.length >= 3

  const save = async () => {
    if (!opponentName.trim()) { toast("Renseigne le nom de l'adversaire", "error"); return }
    setLoading(true)
    try {
      const result = await createPersonalMatch({
        opponent_name: opponentName.trim(),
        match_type: matchType,
        date,
        location: location || null,
        notes: notes || null,
        sets: filledSets.map((s) => ({
          player: parseInt(s.player) || 0,
          opponent: parseInt(s.opponent) || 0,
        })),
      })

      if (!result.ok) {
        toast(result.error, "error")
        return
      }

      toast("Match enregistré !", "success")
      router.push("/dashboard")
    } catch {
      toast("Erreur lors de l'enregistrement", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <TopBar title={step === 1 ? "Match" : "Score"} showBack />

      <div className="flex h-[2px]">
        {[1, 2].map((i) => (
          <div key={i} className={`flex-1 transition-all duration-500 ${i <= step ? "bg-white" : "bg-white/10"}`} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-4 pt-8 pb-6">
                <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-2">Adversaire</div>
                <div className="font-display font-light text-white leading-tight" style={{ fontSize: 40 }}>
                  Contre<br />qui ?
                </div>
              </div>

              <div className="px-4 pb-6">
                <input
                  type="text"
                  placeholder="Nom de l'adversaire"
                  value={opponentName}
                  onChange={(e) => setOpponentName(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-b border-white/20 text-white font-display font-light pb-3 outline-none focus:border-white/50 transition-colors placeholder:text-white/20"
                  style={{ fontSize: 32 }}
                />
              </div>

              <div className="text-[9px] text-sage uppercase tracking-[0.3em] px-4 mb-3">Type de match</div>
              {MATCH_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setMatchType(t.value)}
                  className={`w-full flex items-center gap-4 px-4 py-4 border-b border-white/[0.05] text-left transition-all ${
                    matchType === t.value ? "bg-surface" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className={`w-[3px] self-stretch flex-shrink-0 transition-colors ${
                    matchType === t.value ? "bg-green-light" : "bg-white/10"
                  }`} />
                  <div className="flex-1">
                    <div className={`font-display text-2xl font-light transition-colors ${
                      matchType === t.value ? "text-white" : "text-white/40"
                    }`}>{t.label}</div>
                    <div className="text-[10px] text-sage mt-0.5">{t.sub}</div>
                  </div>
                  {matchType === t.value && (
                    <div className="text-[9px] text-green-light uppercase tracking-widest">✓</div>
                  )}
                </button>
              ))}

              <div className="px-4 pt-6 pb-4 flex gap-5">
                <div className="flex-1">
                  <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="flex-1">
                  <Input label="Lieu (optionnel)" placeholder="Club..." value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Score hero */}
              {filledSets.length > 0 ? (
                <div className={`-mx-0 px-4 py-8 mb-0 ${hasResult ? (isLeading ? "bg-green" : "bg-red/20") : "bg-surface"}`}>
                  <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-1">Score</div>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[9px] text-sage uppercase tracking-widest mb-1">Toi</div>
                      <div className={`font-display font-light leading-none ${isLeading ? "text-white" : "text-white/50"}`} style={{ fontSize: 80 }}>
                        {setsWon}
                      </div>
                    </div>
                    <div className="text-white/20 font-display" style={{ fontSize: 48 }}>—</div>
                    <div>
                      <div className="text-[9px] text-sage uppercase tracking-widest mb-1">{opponentName || "Adversaire"}</div>
                      <div className={`font-display font-light leading-none ${!isLeading ? "text-red" : "text-white/50"}`} style={{ fontSize: 80 }}>
                        {setsLost}
                      </div>
                    </div>
                    {hasResult && (
                      <div className={`ml-auto self-end pb-4 text-[9px] uppercase tracking-widest border px-3 py-1 ${
                        isLeading ? "border-white text-white" : "border-red text-red"
                      }`}>
                        {isLeading ? "Victoire" : "Défaite"}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-4 pt-8 pb-6">
                  <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-2">Score</div>
                  <div className="font-display font-light text-white leading-tight" style={{ fontSize: 40 }}>
                    Quel était<br />le score ?
                  </div>
                </div>
              )}

              {/* Sets */}
              <div className="mt-0">
                {sets.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.05]"
                  >
                    <div className="text-[9px] text-sage uppercase tracking-widest w-8 flex-shrink-0">S{i + 1}</div>
                    <input
                      type="number" min="0" max="21"
                      placeholder="11"
                      value={s.player}
                      onChange={(e) => updateSet(i, "player", e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 text-white text-center font-display font-light py-2 outline-none focus:border-white/60 transition-colors placeholder:text-white/15"
                      style={{ fontSize: 36 }}
                    />
                    <span className="text-white/20 font-display text-2xl flex-shrink-0">—</span>
                    <input
                      type="number" min="0" max="21"
                      placeholder="9"
                      value={s.opponent}
                      onChange={(e) => updateSet(i, "opponent", e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 text-white text-center font-display font-light py-2 outline-none focus:border-white/60 transition-colors placeholder:text-white/15"
                      style={{ fontSize: 36 }}
                    />
                    {sets.length > 1 && (
                      <button
                        onClick={() => removeSet(i)}
                        className="text-white/20 hover:text-red transition-colors flex-shrink-0 p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              <button
                onClick={addSet}
                className="flex items-center gap-2 px-4 py-4 text-[10px] text-sage hover:text-white transition-colors uppercase tracking-[0.2em] w-full border-b border-white/[0.05]"
              >
                <Plus size={13} /> Ajouter un set
              </button>

              <div className="px-4 pt-6 pb-4">
                <Textarea
                  label="Notes (optionnel)"
                  placeholder="Tactiques, observations, moments clés..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 px-4 py-4 border-t border-white/[0.06] bg-black flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-shrink-0 px-4 text-sage hover:text-white transition-colors font-sans text-sm"
          >
            ←
          </button>
        )}
        {step === 1 ? (
          <Button onClick={() => setStep(2)} fullWidth size="lg" disabled={!opponentName.trim()}>
            Saisir le score →
          </Button>
        ) : (
          <Button onClick={save} loading={loading} fullWidth size="lg">
            Enregistrer le match
          </Button>
        )}
      </div>
    </div>
  )
}
