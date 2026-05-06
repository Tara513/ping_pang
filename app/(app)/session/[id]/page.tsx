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
import { SESSION_TYPE_COLORS } from "@/types/app"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { demoSessions } from "@/lib/seeds/demoData"
import { Disc, Dumbbell, Swords, Target, Trophy, Coffee, MapPin, Search, type LucideIcon } from "lucide-react"

const SESSION_LABELS: Record<string, string> = {
  technique: "Technique", physique: "Physique", match: "Match",
  service: "Service", competition: "Compétition", chill: "Chill"
}
const SESSION_ICON_MAP: Record<string, LucideIcon> = {
  technique: Disc, physique: Dumbbell, match: Swords,
  service: Target, competition: Trophy, chill: Coffee
}
const FEELING_LABELS = ["", "Mauvais", "Bof", "Neutre", "Bien", "Excellent"]

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
              <div key={i} className="bg-anthracite border border-white/[0.08] h-24" />
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
          <div className="text-center py-20 flex flex-col items-center gap-3 text-olive">
            <Search size={36} strokeWidth={1} />
            <div>Séance introuvable</div>
          </div>
        </PageWrapper>
      </>
    )
  }

  const color = SESSION_TYPE_COLORS[session.session_type] || "#4A5240"
  const dateStr = format(new Date(session.date), "EEEE d MMMM yyyy", { locale: fr })
  const hours = Math.floor(session.duration_min / 60)
  const mins = session.duration_min % 60

  return (
    <>
      <TopBar title={SESSION_LABELS[session.session_type] || session.session_type} showBack />
      <PageWrapper>
        <div className="pt-4 flex flex-col gap-4">
          {/* Header card */}
          <div className="p-5 border border-white/[0.08]" style={{ backgroundColor: `${color}20`, borderColor: `${color}40` }}>
            <div className="flex items-center gap-3 mb-3">
              {(() => { const Icon = SESSION_ICON_MAP[session.session_type] || Disc; return <Icon size={36} strokeWidth={1.5} className="text-white/70" /> })()}
              <div>
                <div className="font-display text-3xl text-white uppercase">{SESSION_LABELS[session.session_type]}</div>
                <div className="text-olive text-sm capitalize">{dateStr}</div>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="text-[10px] text-olive uppercase tracking-wider">Durée</div>
                <div className="font-display text-2xl text-white">
                  {hours > 0 ? `${hours}h` : ""}{mins > 0 ? `${mins}min` : ""}
                </div>
              </div>
              {session.location && (
                <div>
                  <div className="text-[10px] text-olive uppercase tracking-wider">Lieu</div>
                  <div className="font-sans text-sm text-white flex items-center gap-1">
                    <MapPin size={12} strokeWidth={1.5} /> {session.location}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ressenti */}
          {session.has_description && session.feeling && (
            <Card>
              <div className="text-[10px] text-olive uppercase tracking-wider mb-3 font-semibold">Ressenti</div>
              <div className="grid grid-cols-2 gap-4">
                {session.feeling && (
                  <div>
                    <div className="text-xs text-olive mb-1">Général</div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xl text-white">{session.feeling}/5</span>
                      <span className="text-xs text-olive">{FEELING_LABELS[session.feeling]}</span>
                    </div>
                  </div>
                )}
                {session.fatigue && (
                  <div>
                    <div className="text-xs text-olive mb-1">Fatigue</div>
                    <div className="font-display text-xl text-white">{session.fatigue}/5</div>
                  </div>
                )}
                {session.motivation && (
                  <div>
                    <div className="text-xs text-olive mb-1">Motivation</div>
                    <div className="font-display text-xl text-white">{session.motivation}/5</div>
                  </div>
                )}
                {session.confidence && (
                  <div>
                    <div className="text-xs text-olive mb-1">Confiance</div>
                    <div className="font-display text-xl text-white">{session.confidence}/5</div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Exercices */}
          {session.exercises && session.exercises.length > 0 && (
            <Card>
              <div className="text-[10px] text-olive uppercase tracking-wider mb-3 font-semibold">
                Exercices ({session.exercises.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {session.exercises.map((ex, i) => (
                  <Badge key={i} label={ex.name} color="kaki" size="md" />
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {session.notes && (
            <Card>
              <div className="text-[10px] text-olive uppercase tracking-wider mb-2 font-semibold">Notes</div>
              <p className="text-sm text-white/80 leading-relaxed">{session.notes}</p>
            </Card>
          )}

          {/* Coach comment */}
          {session.coach_comment && (
            <Card className="border-kaki/40">
              <div className="flex items-center gap-2 mb-2">
                <Badge label="Coach" color="kaki" />
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{session.coach_comment}</p>
            </Card>
          )}
        </div>
      </PageWrapper>
    </>
  )
}
