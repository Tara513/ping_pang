"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Card from "@/components/ui/Card"
import type { Profile } from "@/types/database"

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

const TYPE_COLORS: Record<string, string> = {
  technique: "#4A5240", physique: "#8A9178", match: "#C8352A",
  service: "#E8C840", competition: "#E8C840", chill: "#2A2A2A", repos: "#1A1A1A",
}

interface DayProgram {
  type: string
  label: string
  duration: number
  focus: string
  exercises: string[]
  icon: string
}

function generateProgram(level: string | null, style: string | null, targetHours: number): DayProgram[] {
  const h = targetHours || 5

  const byLevel: Record<string, DayProgram[]> = {
    beginner: [
      { type: "technique", label: "Technique", duration: 60, focus: "Régularité et placement de base", icon: "🏓", exercises: ["Coup droit croisé", "Revers croisé", "Footwork basique"] },
      { type: "repos", label: "Repos", duration: 0, focus: "Récupération active", icon: "😴", exercises: [] },
      { type: "service", label: "Service", duration: 60, focus: "Apprentissage des services de base", icon: "🎯", exercises: ["Service pendule", "Service bombe", "Variation longueur"] },
      { type: "repos", label: "Repos", duration: 0, focus: "Récupération", icon: "😴", exercises: [] },
      { type: "technique", label: "Technique", duration: 60, focus: "Jeu complet de table", icon: "🏓", exercises: ["Bloc revers", "Contre-attaque", "Jeu libre"] },
      { type: "match", label: "Match", duration: 90, focus: "Mise en pratique en situation", icon: "⚔️", exercises: ["Match entraînement", "Retour de service", "Variation tactique"] },
      { type: "repos", label: "Repos", duration: 0, focus: "Récupération totale", icon: "😴", exercises: [] },
    ],
    intermediate: [
      { type: "technique", label: "Technique", duration: 90, focus: "Topspins et régularité avancée", icon: "🏓", exercises: ["Topspin coup droit croisé", "Topspin revers", "Contre-topspin"] },
      { type: "physique", label: "Physique", duration: 60, focus: "Cardio spécifique et placement", icon: "💪", exercises: ["Footwork", "Shadow", "Cardio spécifique TT"] },
      { type: "service", label: "Service + Retour", duration: 60, focus: "Variation et placement", icon: "🎯", exercises: ["Service court revers", "Flip coup droit", "Push long"] },
      { type: "repos", label: "Repos", duration: 0, focus: "Récupération", icon: "😴", exercises: [] },
      { type: "technique", label: "Technique", duration: 90, focus: "Attaque en 3e balle", icon: "🏓", exercises: ["Service + attaque", "Défense contre-attaque", "Jeu complet"] },
      { type: "match", label: "Match", duration: 120, focus: "Compétition simulée", icon: "⚔️", exercises: ["Matchs 3 sets", "Analyse des erreurs", "Tactique"] },
      { type: "chill", label: "Chill", duration: 60, focus: "Plaisir et expérimentation", icon: "😎", exercises: ["Jeu libre", "Expérimentation"] },
    ],
    advanced: [
      { type: "technique", label: "Technique intensive", duration: 120, focus: "Qualité et puissance des coups", icon: "🏓", exercises: ["Topspin accéléré", "Coup droit longue ligne", "Revers flip"] },
      { type: "physique", label: "Physique", duration: 90, focus: "Endurance et explosivité", icon: "💪", exercises: ["Footwork avancé", "Shadow intense", "Gainage"] },
      { type: "service", label: "Service tactique", duration: 90, focus: "Stratégie et variations", icon: "🎯", exercises: ["Multiball services", "Retour variation", "3e balle"] },
      { type: "match", label: "Match analyse", duration: 120, focus: "Identification des axes de progrès", icon: "⚔️", exercises: ["Matchs complets", "Analyse vidéo", "Correction ciblée"] },
      { type: "technique", label: style === "attacker" ? "Attaque coup droit" : style === "defender" ? "Défense" : "Point fort", duration: 90, focus: "Spécialisation de ton style", icon: "🏓", exercises: ["Exercices spécialisés", "Répétitions ciblées"] },
      { type: "competition", label: "Compétition", duration: 180, focus: "Mise en situation compétition", icon: "🏆", exercises: ["Compétition officielle ou simulée"] },
      { type: "repos", label: "Repos actif", duration: 30, focus: "Récupération et visualisation mentale", icon: "😴", exercises: ["Étirements", "Visualisation"] },
    ],
    competitive: [
      { type: "technique", label: "Technique", duration: 120, focus: "Perfection des coups clés", icon: "🏓", exercises: ["Répétitions topspins", "Précision coup droit", "Revers accéléré"] },
      { type: "physique", label: "Physique", duration: 90, focus: "Performance athlétique maximale", icon: "💪", exercises: ["Footwork complexe", "Explosivité", "Endurance TT"] },
      { type: "service", label: "Service + Tactique", duration: 90, focus: "Stratégie contre différents profils", icon: "🎯", exercises: ["Services variés", "Tactique adversaire", "Breakdowns"] },
      { type: "match", label: "Match intensif", duration: 120, focus: "Intensité maximale", icon: "⚔️", exercises: ["Matchs 5 sets", "Simulation compétition", "Mental"] },
      { type: "physique", label: "Récupération active", duration: 60, focus: "Préparation physique fine", icon: "💪", exercises: ["Cardio modéré", "Étirements", "Massage"] },
      { type: "competition", label: "Compétition", duration: 240, focus: "Résultats officiels", icon: "🏆", exercises: ["Tournoi ou championnat"] },
      { type: "repos", label: "Repos complet", duration: 0, focus: "Récupération totale", icon: "😴", exercises: [] },
    ],
    elite: [
      { type: "technique", label: "Entraînement pro", duration: 180, focus: "Excellence technique absolue", icon: "🏓", exercises: ["Multiball intensif", "Topspins accélérés", "Précision maximale"] },
      { type: "physique", label: "Prépa physique", duration: 120, focus: "Performance de haut niveau", icon: "💪", exercises: ["Entraînement athlétique", "Explosivité", "Proprioception"] },
      { type: "technique", label: "Tactique avancée", duration: 150, focus: "Jeu stratégique élite", icon: "🏓", exercises: ["Analyse adversaires", "Tactique personnalisée", "Pattern avancés"] },
      { type: "match", label: "Sparring top niveau", duration: 180, focus: "Confrontation haut niveau", icon: "⚔️", exercises: ["Sparring avec joueurs forts", "Analyse vidéo", "Débriefing"] },
      { type: "service", label: "Service + Mental", duration: 90, focus: "Préparation mentale et technique", icon: "🎯", exercises: ["Routines de service", "Visualisation", "Focus mental"] },
      { type: "competition", label: "Compétition", duration: 480, focus: "Performance internationale", icon: "🏆", exercises: ["Tournoi international"] },
      { type: "repos", label: "Récupération", duration: 60, focus: "Régénération complète", icon: "😴", exercises: ["Physiothérapie", "Nutrition optimale", "Sommeil"] },
    ],
  }

  return byLevel[level || "intermediate"] || byLevel.intermediate
}

export default function ProgramPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const [targetHours, setTargetHours] = useState(5)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: p }, { data: g }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("weekly_goals").select("*").eq("player_id", user.id).order("created_at", { ascending: false }).limit(1).single(),
      ])
      setProfile(p)
      if (g?.target_hours) setTargetHours(Number(g.target_hours))
      setLoading(false)
    }
    load()
  }, [supabase])

  const program = generateProgram(profile?.level || null, profile?.play_style || null, targetHours)
  const totalMin = program.reduce((acc, d) => acc + d.duration, 0)
  const selProgram = selectedDay !== null ? program[selectedDay] : null

  const LEVEL_LABELS: Record<string, string> = {
    beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé",
    competitive: "Compétiteur", elite: "Elite",
  }

  return (
    <>
      <TopBar title="Mon programme" />
      <PageWrapper>
        <div className="pt-4 flex flex-col gap-4">
          {/* Header */}
          <Card className="border-green/30">
            <div className="text-[10px] text-green-light uppercase tracking-wider mb-2 font-semibold">Programme personnalisé</div>
            <p className="text-sm text-white/80">
              Niveau <span className="text-white font-semibold">{LEVEL_LABELS[profile?.level || ""] || "Intermédiaire"}</span>{" · "}
              Objectif <span className="text-white font-semibold">{targetHours}h/semaine</span>
            </p>
            <div className="mt-2 text-[10px] text-sage">Volume planifié : {Math.round(totalMin / 60 * 10) / 10}h · Clique sur un jour pour le détail</div>
          </Card>

          {/* Week grid */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day, i) => {
              const p = program[i]
              const isSelected = selectedDay === i
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : i)}
                  className={`flex flex-col items-center gap-1 p-2 border transition-all ${
                    isSelected ? "border-green bg-green/20" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <span className="text-[9px] text-sage uppercase">{day.slice(0, 3)}</span>
                  <span className="text-xl">{p.icon}</span>
                  {p.duration > 0 && (
                    <span className="text-[8px] text-white/50">{p.duration}m</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected day detail */}
          {selProgram && selectedDay !== null && (
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selProgram.icon}</span>
                <div className="flex-1">
                  <div className="font-display text-2xl font-light text-white">{DAYS[selectedDay]}</div>
                  <div className="text-sage text-sm">{selProgram.label}</div>
                </div>
                {selProgram.duration > 0 && (
                  <div className="text-right">
                    <div className="font-display text-3xl text-white">{selProgram.duration}<span className="text-lg">min</span></div>
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 pt-3 flex flex-col gap-3">
                <div>
                  <div className="text-[10px] text-sage uppercase tracking-wider mb-1 font-semibold">Focus du jour</div>
                  <p className="text-sm text-white/80">{selProgram.focus}</p>
                </div>
                {selProgram.exercises.length > 0 && (
                  <div>
                    <div className="text-[10px] text-sage uppercase tracking-wider mb-2 font-semibold">Exercices</div>
                    <div className="flex flex-col gap-1.5">
                      {selProgram.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                          <div className="w-1.5 h-1.5 bg-green flex-shrink-0" />
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Full week list */}
          <div className="flex flex-col gap-2">
            <div className="text-[10px] text-sage uppercase tracking-wider font-semibold">Planning de la semaine</div>
            {program.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(selectedDay === i ? null : i)}
                className={`flex items-center gap-3 p-3 border transition-all text-left ${
                  selectedDay === i ? "border-green bg-green/10" : "border-white/[0.08] bg-surface hover:border-white/20"
                }`}
              >
                <div className="w-1 h-10 flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[day.type] }} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{DAYS[i]}</div>
                  <div className="text-xs text-sage">{day.label} · {day.focus.split(" ").slice(0, 4).join(" ")}...</div>
                </div>
                <div className="text-right flex-shrink-0">
                  {day.duration > 0 ? (
                    <div className="text-sm text-white/60">{day.duration}min</div>
                  ) : (
                    <div className="text-xs text-white/30">Repos</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
