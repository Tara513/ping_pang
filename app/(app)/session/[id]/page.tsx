"use client"

export const dynamic = "force-dynamic"


import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import type { Session } from "@/types/database"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { demoSessions } from "@/lib/seeds/demoData"

const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill"
}
const SESSION_ICONS: Record<string, string> = {
  technique: "🏓", physique: "💪", match: "⚔️", service: "🎯", competition: "🏆", chill: "😎"
}
const FEELING_ICONS = ["", "😤", "😕", "😐", "😊", "🤩"]

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("sessions").select("*").eq("id", id).single()
      if (data) {
        setSession(data)
      } else {
        const demo = (demoSessions as Partial<Session>[]).find((s) => s.id === id)
        if (demo) setSession(demo as Session)
      }
      setLoading(false)
    }
    load()
  }, [id, supabase])

  if (loading) {
    return (
      <>
        <TopBar title="Séance" showBack />
        <PageWrapper>
          <div className="flex flex-col gap-4 pt-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-ppp-card border border-ppp-border h-24 rounded-md" />
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
            <div className="text-ppp-muted font-serif">Séance introuvable</div>
          </div>
        </PageWrapper>
      </>
    )
  }

  const dateStr = format(new Date(session.date), "EEEE d MMMM yyyy", { locale: fr })
  const hours = Math.floor(session.duration_min / 60)
  const mins = session.duration_min % 60

  return (
    <>
      <TopBar title={SESSION_LABELS[session.session_type] || session.session_type} showBack />
      <PageWrapper>
        <div className="pt-4 flex flex-col gap-4">
          {/* Header card */}
          <div className="p-5 bg-ppp-forest rounded-md">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{SESSION_ICONS[session.session_type]}</span>
              <div>
                <div className="font-serif font-bold text-3xl text-ppp-white uppercase">{SESSION_LABELS[session.session_type]}</div>
                <div className="text-ppp-white/60 text-sm capitalize">{dateStr}</div>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="text-[10px] text-ppp-white/50 uppercase tracking-wider">Durée</div>
                <div className="font-serif font-bold text-2xl text-ppp-white">
                  {hours > 0 ? `${hours}h` : ""}{mins > 0 ? `${mins}min` : ""}
                </div>
              </div>
              {session.location && (
                <div>
                  <div className="text-[10px] text-ppp-white/50 uppercase tracking-wider">Lieu</div>
                  <div className="font-serif text-sm text-ppp-white">📍 {session.location}</div>
                </div>
              )}
            </div>
          </div>

          {/* Ressenti */}
          {session.has_description && session.feeling && (
            <Card>
              <div className="text-[10px] text-ppp-muted uppercase tracking-wider mb-3 font-semibold">Ressenti</div>
              <div className="grid grid-cols-2 gap-4">
                {session.feeling && (
                  <div>
                    <div className="text-xs text-ppp-muted mb-1 font-serif">Général</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{FEELING_ICONS[session.feeling]}</span>
                      <span className="font-serif font-bold text-xl text-ppp-text">{session.feeling}/5</span>
                    </div>
                  </div>
                )}
                {session.fatigue && (
                  <div>
                    <div className="text-xs text-ppp-muted mb-1 font-serif">Fatigue</div>
                    <div className="font-serif font-bold text-xl text-ppp-text">{session.fatigue}/5</div>
                  </div>
                )}
                {session.motivation && (
                  <div>
                    <div className="text-xs text-ppp-muted mb-1 font-serif">Motivation</div>
                    <div className="font-serif font-bold text-xl text-ppp-text">{session.motivation}/5</div>
                  </div>
                )}
                {session.confidence && (
                  <div>
                    <div className="text-xs text-ppp-muted mb-1 font-serif">Confiance</div>
                    <div className="font-serif font-bold text-xl text-ppp-text">{session.confidence}/5</div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Exercices */}
          {session.exercises && session.exercises.length > 0 && (
            <Card>
              <div className="text-[10px] text-ppp-muted uppercase tracking-wider mb-3 font-semibold">
                Exercices ({session.exercises.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {session.exercises.map((ex, i) => (
                  <Badge key={i} label={ex.name} color="forest" size="md" />
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {session.notes && (
            <Card>
              <div className="text-[10px] text-ppp-muted uppercase tracking-wider mb-2 font-semibold">Notes</div>
              <p className="text-sm text-ppp-text/80 font-serif leading-relaxed">{session.notes}</p>
            </Card>
          )}

          {/* Coach comment */}
          {session.coach_comment && (
            <Card className="border-ppp-forest/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge label="Coach" color="forest" />
              </div>
              <p className="text-sm text-ppp-text/80 font-serif leading-relaxed">{session.coach_comment}</p>
            </Card>
          )}
        </div>
      </PageWrapper>
    </>
  )
}
