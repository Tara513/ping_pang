"use client"

export const dynamic = "force-dynamic"


import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Trash2, Handshake, Medal, Trophy, Target, type LucideIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/Toast"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Card from "@/components/ui/Card"
import type { MatchType } from "@/types/database"

const MATCH_TYPES: { value: MatchType; label: string; icon: LucideIcon }[] = [
  { value: "friendly", label: "Amical", icon: Handshake },
  { value: "league", label: "Championnat", icon: Medal },
  { value: "tournament", label: "Tournoi", icon: Trophy },
  { value: "training", label: "Entraînement", icon: Target },
]

interface SetScore {
  player: string
  opponent: string
}

function ScoreDisplay({ sets }: { sets: SetScore[] }) {
  const setsWon = sets.filter((s) => parseInt(s.player) > parseInt(s.opponent)).length
  const setsLost = sets.filter((s) => parseInt(s.opponent) > parseInt(s.player)).length
  const isWin = setsWon > setsLost && sets.length >= 3

  if (sets.length === 0) return null

  return (
    <div className="flex items-center gap-4 p-4 bg-anthracite border border-white/[0.08]">
      <div className="flex flex-col items-center">
        <div className={`font-display text-4xl leading-none ${isWin ? "text-kaki" : setsLost > setsWon ? "text-red" : "text-white"}`}>
          {setsWon}
        </div>
        <div className="text-[10px] text-olive">SETS</div>
      </div>
      <div className="text-white/30 font-display text-2xl">—</div>
      <div className="flex flex-col items-center">
        <div className={`font-display text-4xl leading-none ${setsLost > setsWon ? "text-red" : "text-white"}`}>
          {setsLost}
        </div>
        <div className="text-[10px] text-olive">SETS</div>
      </div>
      {sets.length >= 3 && (
        <div className={`ml-auto text-xs font-semibold uppercase px-3 py-1 ${isWin ? "bg-kaki text-white" : "bg-red text-white"}`}>
          {isWin ? "Victoire" : "Défaite"}
        </div>
      )}
    </div>
  )
}

export default function NewMatchPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [opponentName, setOpponentName] = useState("")
  const [matchType, setMatchType] = useState<MatchType>("friendly")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [location, setLocation] = useState("")
  const [sets, setSets] = useState<SetScore[]>([{ player: "", opponent: "" }])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const addSet = () => setSets((prev) => [...prev, { player: "", opponent: "" }])
  const removeSet = (i: number) => setSets((prev) => prev.filter((_, idx) => idx !== i))
  const updateSet = (i: number, field: "player" | "opponent", val: string) => {
    setSets((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  const computeResult = () => {
    const won = sets.filter((s) => parseInt(s.player) > parseInt(s.opponent)).length
    const lost = sets.filter((s) => parseInt(s.opponent) > parseInt(s.player)).length
    return { won, lost, result: won > lost ? "win" as const : "loss" as const }
  }

  const save = async () => {
    if (!opponentName.trim()) {
      toast("Renseigne le nom de l'adversaire", "error")
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { won, lost, result } = computeResult()
      const validSets = sets.filter((s) => s.player !== "" && s.opponent !== "")

      await supabase.from("matches").insert({
        player_id: user.id,
        opponent_name: opponentName.trim(),
        match_type: matchType,
        date,
        location: location || null,
        result,
        score_player: validSets.map((s) => parseInt(s.player) || 0),
        score_opponent: validSets.map((s) => parseInt(s.opponent) || 0),
        sets_won: won,
        sets_lost: lost,
        notes: notes || null,
      })

      toast("Match enregistré !", "success")
      router.push("/dashboard")
    } catch {
      toast("Erreur lors de l'enregistrement", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Nouveau match" showBack />
      <PageWrapper>
        <div className="flex flex-col gap-6 pt-4">
          <Input
            label="Adversaire"
            placeholder="Nom de l'adversaire"
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
          />

          <div>
            <p className="text-xs font-semibold text-olive uppercase tracking-wider mb-3">Type de match</p>
            <div className="grid grid-cols-2 gap-2">
              {MATCH_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setMatchType(t.value)}
                  className={`flex items-center gap-3 p-3 border text-left transition-all ${
                    matchType === t.value
                      ? "border-kaki bg-kaki/20 text-white"
                      : "border-white/10 text-olive hover:border-white/30"
                  }`}
                >
                  <t.icon size={18} strokeWidth={1.5} />
                  <span className="font-semibold text-sm">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input label="Lieu" placeholder="Club..." value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>

          {/* Score par set */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-olive uppercase tracking-wider">Score par set</p>
              <button onClick={addSet} className="flex items-center gap-1 text-xs text-olive hover:text-white transition-colors">
                <Plus size={14} /> Ajouter set
              </button>
            </div>

            <ScoreDisplay sets={sets} />

            <div className="flex flex-col gap-2 mt-3">
              {sets.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="text-xs text-olive uppercase tracking-wider w-8">S{i + 1}</div>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="number"
                      min="0"
                      max="21"
                      placeholder="11"
                      value={s.player}
                      onChange={(e) => updateSet(i, "player", e.target.value)}
                      className="w-full bg-transparent border border-white/25 text-white text-center font-display text-2xl py-2 outline-none focus:border-olive transition-colors"
                    />
                    <span className="text-olive font-display text-xl">—</span>
                    <input
                      type="number"
                      min="0"
                      max="21"
                      placeholder="9"
                      value={s.opponent}
                      onChange={(e) => updateSet(i, "opponent", e.target.value)}
                      className="w-full bg-transparent border border-white/25 text-white text-center font-display text-2xl py-2 outline-none focus:border-olive transition-colors"
                    />
                  </div>
                  {sets.length > 1 && (
                    <button
                      onClick={() => removeSet(i)}
                      className="text-olive/50 hover:text-red transition-colors p-1"
                      aria-label="Supprimer set"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <Textarea
            label="Notes (optionnel)"
            placeholder="Tactiques, observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button onClick={save} loading={loading} fullWidth size="lg">
            Enregistrer le match
          </Button>
        </div>
      </PageWrapper>
    </>
  )
}
