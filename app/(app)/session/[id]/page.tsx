"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Button from "@/components/ui/Button"
import Textarea from "@/components/ui/Textarea"
import { useToast } from "@/components/ui/Toast"
import type { Session, Profile } from "@/types/database"
import { SESSION_TYPE_COLORS } from "@/types/app"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { demoSessions } from "@/lib/seeds/demoData"
import { allowDemoData } from "@/lib/demo"

const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill",
}

const FEELING_LABELS = ["", "Mauvais", "Bof", "Neutre", "Bien", "Excellent"]
const FEELING_EMOJIS = ["", "😤", "😕", "😐", "😊", "🤩"]

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1 mt-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-[3px] transition-colors ${i < value ? "bg-white" : "bg-white/10"}`}
        />
      ))}
    </div>
  )
}

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
      } else if (allowDemoData) {
        const demo = (demoSessions as Partial<Session>[]).find((s) => s.id === id)
        if (demo) { setSession(demo as Session); setCoachComment(demo.coach_comment || "") }
      }
      setLoading(false)
    }
    load()
  }, [id, supabase])

  const saveCoachComment = async () => {
    if (!session) return
    setSavingComment(true)
    const { error } = await supabase.from("sessions").update({ coach_comment: coachComment }).eq("id", session.id)
    if (error) toast("Erreur lors de la sauvegarde", "error")
    else { toast("Commentaire enregistré ✓", "success"); setSession((prev) => prev ? { ...prev, coach_comment: coachComment } : prev) }
    setSavingComment(false)
  }

  if (loading) {
    return (
      <>
        <TopBar title="Séance" showBack />
        <PageWrapper>
          <div className="animate-pulse space-y-4 pt-4">
            <div className="h-32 bg-surface" />
            <div className="h-24 bg-surface" />
            <div className="h-20 bg-surface" />
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
          <div className="text-center py-24">
            <div className="font-display text-6xl font-light text-white/10">?</div>
            <div className="text-[10px] text-sage uppercase tracking-[0.2em] mt-3">Séance introuvable</div>
          </div>
        </PageWrapper>
      </>
    )
  }

  const accentColor = SESSION_TYPE_COLORS[session.session_type] || "#1A5C4A"
  const dateStr = format(new Date(session.date), "EEEE d MMMM yyyy", { locale: fr })
  const hours = Math.floor(session.duration_min / 60)
  const mins = session.duration_min % 60
  const durationStr = [hours > 0 ? `${hours}h` : "", mins > 0 ? `${mins}min` : ""].filter(Boolean).join(" ")
  const isCoach = profile?.is_coach === true

  return (
    <>
      <TopBar title={SESSION_LABELS[session.session_type] || session.session_type} showBack />
      <PageWrapper noPadding>
        {/* Hero — full bleed */}
        <div className="px-4 pt-8 pb-6" style={{ backgroundColor: `${accentColor}18` }}>
          <div className="border-l-[3px] pl-4" style={{ borderColor: accentColor }}>
            <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-1">
              {SESSION_LABELS[session.session_type]}
            </div>
            <div className="font-display font-light text-white leading-none" style={{ fontSize: 56 }}>
              {durationStr}
            </div>
            <div className="text-[11px] text-sage mt-2 capitalize">{dateStr}</div>
            {session.location && (
              <div className="text-[11px] text-sage/60 mt-0.5">{session.location}</div>
            )}
          </div>
        </div>

        <div className="px-4 py-4">
          {/* Ressenti */}
          {session.has_description && session.feeling && (
            <div className="mb-6">
              <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-4">Ressenti</div>

              <div className="flex items-center gap-4 py-4 border-b border-white/[0.05]">
                <div className="text-3xl">{FEELING_EMOJIS[session.feeling]}</div>
                <div className="flex-1">
                  <div className="text-[9px] text-sage uppercase tracking-[0.2em]">Général</div>
                  <div className="font-display text-2xl font-light text-white">{FEELING_LABELS[session.feeling]}</div>
                </div>
                <div className="font-display text-3xl font-light text-white">{session.feeling}/5</div>
              </div>

              {[
                { label: "Fatigue", value: session.fatigue },
                { label: "Motivation", value: session.motivation },
                { label: "Confiance", value: session.confidence },
              ].filter((x) => x.value).map((x) => (
                <div key={x.label} className="py-4 border-b border-white/[0.05]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[9px] text-sage uppercase tracking-[0.2em]">{x.label}</div>
                    <div className="font-display text-xl font-light text-white">{x.value}/5</div>
                  </div>
                  <RatingBar value={x.value!} />
                </div>
              ))}
            </div>
          )}

          {/* Exercices */}
          {session.exercises && session.exercises.length > 0 && (
            <div className="mb-6">
              <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-4">
                Exercices <span className="text-white/30">({session.exercises.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.exercises.map((ex, i) => (
                  <span
                    key={i}
                    className="text-[11px] border border-white/15 text-white/70 px-3 py-1 font-sans uppercase tracking-[0.08em]"
                  >
                    {ex.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {session.notes && (
            <div className="mb-6">
              <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-3">Notes</div>
              <div className="border-l-2 border-white/10 pl-4">
                <p className="text-sm text-white/70 leading-relaxed font-sans">{session.notes}</p>
              </div>
            </div>
          )}

          {/* Coach comment — read */}
          {!isCoach && session.coach_comment && (
            <div className="mb-6">
              <div className="text-[9px] text-green-light uppercase tracking-[0.2em] mb-3">Commentaire coach</div>
              <div className="border-l-2 border-green-light pl-4">
                <p className="text-sm text-white/80 leading-relaxed font-sans">{session.coach_comment}</p>
              </div>
            </div>
          )}

          {/* Coach mode — write */}
          {isCoach && (
            <div className="mb-6">
              <div className="text-[9px] text-green-light uppercase tracking-[0.2em] mb-4">Mode coach</div>
              <Textarea
                label="Commentaire"
                placeholder="Feedback, points à travailler, observations..."
                value={coachComment}
                onChange={(e) => setCoachComment(e.target.value)}
              />
              <div className="mt-4">
                <Button
                  onClick={saveCoachComment}
                  loading={savingComment}
                  size="sm"
                  variant="secondary"
                  disabled={coachComment === (session.coach_comment || "")}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  )
}
