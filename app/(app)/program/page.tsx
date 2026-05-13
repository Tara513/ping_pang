"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import type { Profile } from "@/types/database"

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

const TYPE_COLORS: Record<string, string> = {
  technique: "#1A5C4A", physique: "#7A9E8E", match: "#C72927",
  service: "#D4C9B5", competition: "#D4C9B5", chill: "#2A2A2A", repos: "#161616",
}

interface DayProgram {
  type: string
  label: string
  duration: number
  focus: string
  exercises: string[]
}

function generateProgram(level: string | null, style: string | null): DayProgram[] {
  const byLevel: Record<string, DayProgram[]> = {
    beginner: [
      { type: "technique", label: "Technique", duration: 60, focus: "Régularité et placement de base", exercises: ["Coup droit croisé", "Revers croisé", "Footwork basique"] },
      { type: "repos", label: "Repos", duration: 0, focus: "Récupération active", exercises: [] },
      { type: "service", label: "Service", duration: 60, focus: "Apprentissage des services de base", exercises: ["Service pendule", "Service bombe", "Variation longueur"] },
      { type: "repos", label: "Repos", duration: 0, focus: "Récupération", exercises: [] },
      { type: "technique", label: "Technique", duration: 60, focus: "Jeu complet de table", exercises: ["Bloc revers", "Contre-attaque", "Jeu libre"] },
      { type: "match", label: "Match", duration: 90, focus: "Mise en pratique en situation", exercises: ["Match entraînement", "Retour de service"] },
      { type: "repos", label: "Repos", duration: 0, focus: "Récupération totale", exercises: [] },
    ],
    intermediate: [
      { type: "technique", label: "Technique", duration: 90, focus: "Topspins et régularité avancée", exercises: ["Topspin coup droit croisé", "Topspin revers", "Contre-topspin"] },
      { type: "physique", label: "Physique", duration: 60, focus: "Cardio spécifique et placement", exercises: ["Footwork", "Shadow", "Cardio spécifique TT"] },
      { type: "service", label: "Service + Retour", duration: 60, focus: "Variation et placement", exercises: ["Service court revers", "Flip coup droit", "Push long"] },
      { type: "repos", label: "Repos", duration: 0, focus: "Récupération", exercises: [] },
      { type: "technique", label: "Technique", duration: 90, focus: "Attaque en 3e balle", exercises: ["Service + attaque", "Défense contre-attaque", "Jeu complet"] },
      { type: "match", label: "Match", duration: 120, focus: "Compétition simulée", exercises: ["Matchs 3 sets", "Analyse des erreurs", "Tactique"] },
      { type: "chill", label: "Chill", duration: 60, focus: "Plaisir et expérimentation", exercises: ["Jeu libre", "Expérimentation"] },
    ],
    advanced: [
      { type: "technique", label: "Technique intensive", duration: 120, focus: "Qualité et puissance des coups", exercises: ["Topspin accéléré", "Coup droit longue ligne", "Revers flip"] },
      { type: "physique", label: "Physique", duration: 90, focus: "Endurance et explosivité", exercises: ["Footwork avancé", "Shadow intense", "Gainage"] },
      { type: "service", label: "Service tactique", duration: 90, focus: "Stratégie et variations", exercises: ["Multiball services", "Retour variation", "3e balle"] },
      { type: "match", label: "Match analyse", duration: 120, focus: "Identification des axes de progrès", exercises: ["Matchs complets", "Analyse vidéo", "Correction ciblée"] },
      { type: "technique", label: style === "attacker" ? "Attaque coup droit" : "Point fort", duration: 90, focus: "Spécialisation de ton style", exercises: ["Exercices spécialisés", "Répétitions ciblées"] },
      { type: "competition", label: "Compétition", duration: 180, focus: "Mise en situation compétition", exercises: ["Compétition officielle ou simulée"] },
      { type: "repos", label: "Repos actif", duration: 30, focus: "Récupération et visualisation mentale", exercises: ["Étirements", "Visualisation"] },
    ],
    competitive: [
      { type: "technique", label: "Technique", duration: 120, focus: "Perfection des coups clés", exercises: ["Répétitions topspins", "Précision coup droit", "Revers accéléré"] },
      { type: "physique", label: "Physique", duration: 90, focus: "Performance athlétique maximale", exercises: ["Footwork complexe", "Explosivité", "Endurance TT"] },
      { type: "service", label: "Service + Tactique", duration: 90, focus: "Stratégie contre différents profils", exercises: ["Services variés", "Tactique adversaire"] },
      { type: "match", label: "Match intensif", duration: 120, focus: "Intensité maximale", exercises: ["Matchs 5 sets", "Simulation compétition", "Mental"] },
      { type: "physique", label: "Récupération active", duration: 60, focus: "Préparation physique fine", exercises: ["Cardio modéré", "Étirements"] },
      { type: "competition", label: "Compétition", duration: 240, focus: "Résultats officiels", exercises: ["Tournoi ou championnat"] },
      { type: "repos", label: "Repos complet", duration: 0, focus: "Récupération totale", exercises: [] },
    ],
    elite: [
      { type: "technique", label: "Entraînement pro", duration: 180, focus: "Excellence technique absolue", exercises: ["Multiball intensif", "Topspins accélérés", "Précision maximale"] },
      { type: "physique", label: "Prépa physique", duration: 120, focus: "Performance de haut niveau", exercises: ["Entraînement athlétique", "Explosivité"] },
      { type: "technique", label: "Tactique avancée", duration: 150, focus: "Jeu stratégique élite", exercises: ["Analyse adversaires", "Tactique personnalisée"] },
      { type: "match", label: "Sparring top niveau", duration: 180, focus: "Confrontation haut niveau", exercises: ["Sparring avec joueurs forts", "Analyse vidéo"] },
      { type: "service", label: "Service + Mental", duration: 90, focus: "Préparation mentale et technique", exercises: ["Routines de service", "Visualisation"] },
      { type: "competition", label: "Compétition", duration: 480, focus: "Performance internationale", exercises: ["Tournoi international"] },
      { type: "repos", label: "Récupération", duration: 60, focus: "Régénération complète", exercises: ["Physiothérapie", "Nutrition optimale"] },
    ],
  }

  return byLevel[level || "intermediate"] || byLevel.intermediate
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé",
  competitive: "Compétiteur", elite: "Elite",
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

  const program = generateProgram(profile?.level || null, profile?.play_style || null)
  const totalMin = program.reduce((acc, d) => acc + d.duration, 0)
  const sel = selectedDay !== null ? program[selectedDay] : null

  return (
    <>
      <TopBar title="Programme" />
      <PageWrapper noPadding>
        {/* Hero */}
        <div className="bg-green px-4 pt-8 pb-7">
          <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-1">Programme personnalisé</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display font-light text-white leading-none" style={{ fontSize: 56 }}>
                {Math.round(totalMin / 60 * 10) / 10}h
              </div>
              <div className="text-[11px] text-sage mt-2">par semaine planifié</div>
            </div>
            <div className="text-right pb-1">
              <div className="font-display text-2xl font-light text-green-light">
                {LEVEL_LABELS[profile?.level || ""] || "Intermédiaire"}
              </div>
              <div className="text-[10px] text-sage">objectif {targetHours}h</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-4 pt-4 animate-pulse space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="h-14 bg-surface" />)}
          </div>
        ) : (
          <>
            {/* Day list */}
            <div>
              {program.map((day, i) => {
                const isSelected = selectedDay === i
                const accentColor = TYPE_COLORS[day.type] || "#1A5C4A"
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(isSelected ? null : i)}
                    className={`w-full flex items-center gap-4 px-4 py-4 border-b border-white/[0.05] text-left transition-all ${
                      isSelected ? "bg-surface" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div
                      className="w-[3px] self-stretch flex-shrink-0"
                      style={{ backgroundColor: isSelected ? accentColor : "rgba(255,255,255,0.1)" }}
                    />
                    <div className="flex-1">
                      <div className={`font-sans text-[10px] uppercase tracking-[0.15em] transition-colors ${
                        isSelected ? "text-sage" : "text-sage/50"
                      }`}>{DAYS[i]}</div>
                      <div className={`font-display text-xl font-light mt-0.5 transition-colors ${
                        isSelected ? "text-white" : day.type === "repos" ? "text-white/20" : "text-white/60"
                      }`}>{day.label}</div>
                    </div>
                    <div className={`text-[10px] font-sans flex-shrink-0 ${day.duration > 0 ? "text-sage" : "text-white/20"}`}>
                      {day.duration > 0 ? `${day.duration}min` : "repos"}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Selected day detail */}
            {sel && selectedDay !== null && (
              <div className="border-t border-white/[0.06] px-4 pt-6 pb-6">
                <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-2">{DAYS[selectedDay]}</div>
                <div className="font-display font-light text-white mb-1" style={{ fontSize: 40 }}>
                  {sel.label}
                </div>
                {sel.duration > 0 && (
                  <div className="text-[11px] text-sage mb-5">{sel.duration} minutes</div>
                )}

                <div className="border-l-2 border-white/10 pl-4 mb-6">
                  <p className="text-sm text-white/70 font-sans leading-relaxed">{sel.focus}</p>
                </div>

                {sel.exercises.length > 0 && (
                  <div>
                    <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-3">Exercices</div>
                    {sel.exercises.map((ex, j) => (
                      <div key={j} className="flex items-center gap-3 py-3 border-b border-white/[0.04]">
                        <div className="w-[3px] h-[3px] bg-sage/50 flex-shrink-0" />
                        <span className="text-sm text-white/70 font-sans">{ex}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </PageWrapper>
    </>
  )
}
