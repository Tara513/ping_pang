"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Textarea from "@/components/ui/Textarea"
import { useToast } from "@/components/ui/Toast"
import type { Session, Profile } from "@/types/database"
import { SESSION_TYPE_COLORS } from "@/types/app"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { demoSessions } from "@/lib/seeds/demoData"

const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill",
}
const SESSION_ICONS: Record<string, string> = {
  technique: "🏓", physique: "💪", match: "⚔️", service: "🎯", competition: "🏆", chill: "😎",
}
const FEELING_ICONS = ["", "😤", "😕", "😐", "😊", "🤩"]

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const { toast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const [loading, setLoading] = useState(true)
  const [coachComment, setCoachComment] = useState("")
  const [savingComment, setSavingComment] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(p)
      }
      const { data } = await supabase.from("sessions").select("*").eq("id", id).single()
      if (data) {
        setSession(data)
        setCoachComment(data.coach_comment || "")
      } else {
        const demo = (demoSessions as Partial<Session>[]).find((s) => s.id === id)
        if (demo) {
          setSession(demo as Session)
          setCoachComment(demo.coach_comment || "")
        }
      }
      setLoading(false)
    }
    load()
  }, [id, supabase])

  const saveCoachComment = async () => {
    if (!session) return
    setSavingComment(true)
    const { error } = await supabase.from("sessions").update({ coach_comment: coachComment }).eq("id", session.id)
    if (error) {
      toast("Erreur lors de la sauvegarde", "error")
    } else {
      toast("Commentaire coach enregistré ✓", "success")
      setSession(prev => prev ? { ...prev, coach_comment: coachComment } : prev)
    }
    setSavingComment(false)
  }

  if (loading) {
    return (
      <>
        <TopBar title="Séance" showBack />
        <PageWrapper>
          <div className="flex flex-col gap-4 pt-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface border border-white/[0.08] h-24" />
            ))}
          </div>
        </PageWrapper>
      </>
    )
  }

  if (!session) {
    return (
      <>
        <TopBar title="Séance" showBack />
        <PageWrapper>
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-sage">Séance introuvable</div>
          </div>
        </PageWrapper>
      </>
    )
  }

  const color = SESSION_TYPE_COLORS[session.session_type] || "#4A5240"
  const dateStr = format(new Date(session.date), "EEEE d MMMM yyyy", { locale: fr })
  const hours = Math.floor(session.duration_min / 60)
  const mins = session.duration_min % 60
  const isCoach = profile?.is_coach === true

  return (
    <>
      <TopBar title={SESSION_LABELS[session.session_type] || session.session_type} showBack />
      <PageWrapper>
        <div className="pt-4 flex flex-col gap-4">
          {/* Header card */}
          <div className="p-5 border border-white/[0.08]" style={{ backgroundColor: `${color}20`, borderColor: `${color}40` }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{SESSION_ICONS[session.session_type]}</span>
              <div>
                <div className="font-display text-3xl font-light text-white">{SESSION_LABELS[session.session_type]}</div>
                <div className="text-sage text-sm capitalize">{dateStr}</div>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="text-[10px] text-sage uppercase tracking-wider">Durée</div>
                <div className="font-display text-2xl text-white">
                  {hours > 0 ? `${hours}h` : ""}{mins > 0 ? `${mins}min` : ""}
                </div>
              </div>
              {session.location && (
                <div>
                  <div className="text-[10px] text-sage uppercase tracking-wider">Lieu</div>
                  <div className="font-sans text-sm text-white">📍 {session.location}</div>
                </div>
              )}
            </div>
          </div>

          {/* Ressenti */}
          {session.has_description && session.feeling && (
            <Card>
              <div className="text-[10px] text-sage uppercase tracking-wider mb-3 font-semibold">Ressenti</div>
              <div className="grid grid-cols-2 gap-4">
                {session.feeling && (
                  <div>
                    <div className="text-xs text-sage mb-1">Général</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{FEELING_ICONS[session.feeling]}</span>
                      <span className="font-display text-xl text-white">{session.feeling}/5</span>
                    </div>
                  </div>
                )}
                {session.fatigue && (
                  <div>
                    <div className="text-xs text-sage mb-1">Fatigue</div>
                    <div className="font-display text-xl text-white">{session.fatigue}/5</div>
                  </div>
                )}
                {session.motivation && (
                  <div>
                    <div className="text-xs text-sage mb-1">Motivation</div>
                    <div className="font-display text-xl text-white">{session.motivation}/5</div>
                  </div>
                )}
                {session.confidence && (
                  <div>
                    <div className="text-xs text-sage mb-1">Confiance</div>
                    <div className="font-display text-xl text-white">{session.confidence}/5</div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Exercices */}
          {session.exercises && session.exercises.length > 0 && (
            <Card>
              <div className="text-[10px] text-sage uppercase tracking-wider mb-3 font-semibold">
                Exercices ({session.exercises.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {session.exercises.map((ex, i) => (
                  <Badge key={i} label={ex.name} color="green" size="md" />
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {session.notes && (
            <Card>
              <div className="text-[10px] text-sage uppercase tracking-wider mb-2 font-semibold">Notes</div>
              <p className="text-sm text-white/80 leading-relaxed">{session.notes}</p>
            </Card>
          )}

          {/* Coach comment — lecture */}
          {!isCoach && session.coach_comment && (
            <Card className="border-green/40">
              <div className="flex items-center gap-2 mb-2">
                <Badge label="Commentaire coach" color="green" />
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{session.coach_comment}</p>
            </Card>
          )}

          {/* Coach mode — écriture */}
          {isCoach && (
            <Card className="border-green/40">
              <div className="flex items-center gap-2 mb-3">
                <Badge label="Mode coach" color="green" />
              </div>
              <Textarea
                label="Commentaire coach"
                placeholder="Feedback sur cette séance, points à travailler, observations..."
                value={coachComment}
                onChange={(e) => setCoachComment(e.target.value)}
              />
              <div className="mt-3">
                <Button
                  onClick={saveCoachComment}
                  loading={savingComment}
                  size="sm"
                  variant="secondary"
                  disabled={coachComment === (session.coach_comment || "")}
                >
                  Enregistrer le commentaire
                </Button>
              </div>
            </Card>
          )}
        </div>
      </PageWrapper>
    </>
  )
}
