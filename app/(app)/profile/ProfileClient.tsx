"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import { Edit, MapPin, Zap, Wrench } from "lucide-react"
import type { TrainingProfileData } from "@/lib/data/shared-profile"
import type { PgrProfile } from "@/types/database"
import { LEVEL_LABELS, STYLE_LABELS, formatDate, formatElo } from "@/lib/utils/format"

const TABS = ["Activité", "Stats", "PGR", "Matériel", "Badges"] as const
type Tab = (typeof TABS)[number]

function pgrDisplayName(profile: PgrProfile) {
  return profile.display_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Profil PGR lié"
}

function pgrText(value: string | null | undefined, fallback = "Non renseigné") {
  return value && value.trim() !== "" ? value : fallback
}

function pgrClub(profile: PgrProfile) {
  return [profile.club_name, profile.club_city].filter(Boolean).join(" · ") || "Non renseigné"
}

function pgrExternalRanking(profile: PgrProfile) {
  const parts = [
    profile.last_external_source,
    profile.last_external_rank !== null ? `#${profile.last_external_rank}` : null,
    profile.last_external_value !== null ? String(profile.last_external_value) : null,
    profile.last_external_date ? formatDate(profile.last_external_date) : null,
  ]

  return parts.filter(Boolean).join(" · ") || "Non disponible"
}

export function ProfileClient({ data }: { data: TrainingProfileData }) {
  const [tab, setTab] = useState<Tab>("Activité")
  const { profile, sessions, matches, equipment, badges, pgrProfile } = data
  const displayName = profile.full_name || profile.username
  const wins = matches.filter((match) => match.result === "win").length
  const totalHours = sessions.reduce((sum, session) => sum + Number(session.duration_min || 0), 0) / 60

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start gap-4">
          <Avatar name={displayName} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-xl text-onyx">{displayName}</h2>
            <p className="text-sm text-onyx-400">@{profile.username}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.level && <Badge variant="lime">{LEVEL_LABELS[profile.level] || profile.level}</Badge>}
              {profile.play_style && (
                <Badge variant="outline">{STYLE_LABELS[profile.play_style] || profile.play_style}</Badge>
              )}
              {profile.is_coach && <Badge variant="blue">Mode coach</Badge>}
            </div>
          </div>
          <Link href="/profile/edit">
            <Button variant="ghost" size="sm" icon={Edit} />
          </Link>
        </div>
        <div className="mt-3 pt-3 border-t border-onyx-100 flex items-center gap-4 text-sm text-onyx-400">
          {profile.club && (
            <span className="flex items-center gap-1">
              <Zap size={13} />
              {profile.club}
            </span>
          )}
          {(profile.city || profile.country) && (
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {[profile.city, profile.country].filter(Boolean).join(", ")}
            </span>
          )}
        </div>
      </Card>

      <div className="flex gap-0 border-b border-onyx-100 overflow-x-auto">
        {TABS.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === item ? "border-evergreen text-evergreen" : "border-transparent text-onyx-400 hover:text-onyx"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Activité" && (
        <div className="space-y-2">
          {[
            ...sessions.slice(0, 3).map((session) => ({ type: "session" as const, data: session })),
            ...matches.slice(0, 3).map((match) => ({ type: "match" as const, data: match })),
          ]
            .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
            .slice(0, 5)
            .map((item) =>
              item.type === "session" ? (
                <Link key={`session-${item.data.id}`} href={`/sessions/${item.data.id}`}>
                  <Card padding="sm" hover>
                    <p className="text-sm font-medium text-onyx">{formatDate(item.data.date)}</p>
                    <p className="text-xs text-onyx-400">Séance · {item.data.duration_min}min</p>
                  </Card>
                </Link>
              ) : (
                <Link key={`match-${item.data.id}`} href={`/matches/${item.data.id}`}>
                  <Card padding="sm" hover>
                    <p className="text-sm font-medium text-onyx">vs {item.data.opponent_name}</p>
                    <p className={`text-xs ${item.data.result === "win" ? "text-evergreen" : "text-mauve"}`}>
                      {item.data.result === "win" ? "Victoire" : "Défaite"} · {formatDate(item.data.date)}
                    </p>
                  </Card>
                </Link>
              )
            )}
          {sessions.length === 0 && matches.length === 0 && (
            <Card padding="sm">
              <p className="text-sm text-onyx-500">Aucune activité personnelle enregistrée.</p>
            </Card>
          )}
        </div>
      )}

      {tab === "Stats" && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Heures totales" value={`${totalHours.toFixed(1)}h`} />
          <StatCard label="Séances" value={String(sessions.length)} />
          <StatCard label="Matchs" value={String(matches.length)} />
          <StatCard label="Victoires" value={String(wins)} />
          <StatCard label="Win rate" value={matches.length ? `${Math.round((wins / matches.length) * 100)}%` : "-"} />
          <StatCard label="Badges" value={String(badges.length)} />
        </div>
      )}

      {tab === "PGR" && (
        <div className="space-y-3">
          {pgrProfile ? (
            <>
              <Card padding="sm" className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-onyx-400 mb-0.5">Profil PGR lié</p>
                  <p className="break-words text-sm font-semibold text-onyx">{pgrDisplayName(pgrProfile)}</p>
                  <p className="font-heading font-bold text-xl text-onyx">
                    {pgrProfile.rating !== null ? formatElo(pgrProfile.rating) : "Rating pas encore disponible"}
                  </p>
                  {pgrProfile.rating === null && (
                    <p className="text-xs text-onyx-500 mt-1">Les informations joueur sont disponibles, mais aucun snapshot de rating n’est encore publié.</p>
                  )}
                </div>
                <Badge variant="outline" size="sm">
                  {pgrProfile.last_external_rank !== null ? `#${pgrProfile.last_external_rank}` : "PGR"}
                </Badge>
              </Card>

              <Card>
                <CardTitle className="mb-3">Détails PGR</CardTitle>
                <div className="space-y-2 text-sm">
                  <Row label="Nom PGR" value={pgrDisplayName(pgrProfile)} />
                  <Row label="Pays" value={pgrText(pgrProfile.country_code)} />
                  <Row label="Genre" value={pgrText(pgrProfile.gender)} />
                  <Row label="Catégorie" value={pgrText(pgrProfile.category)} />
                  <Row label="Club" value={pgrClub(pgrProfile)} />
                  <Row label="Rating" value={pgrProfile.rating !== null ? formatElo(pgrProfile.rating) : "Rating pas encore disponible"} />
                  <Row
                    label="Matchs PGR"
                    value={pgrProfile.match_count !== null ? String(pgrProfile.match_count) : "Non disponible"}
                  />
                  <Row label="Confiance" value={pgrText(pgrProfile.confidence_status, "Non disponible")} />
                  <Row label="Provisoire" value={pgrProfile.is_provisional === null ? "Non disponible" : pgrProfile.is_provisional ? "Oui" : "Non"} />
                  <Row label="Initialisation" value={pgrText(pgrProfile.initialization_source, "Non disponible")} />
                  <Row
                    label="Snapshot"
                    value={pgrProfile.snapshot_date ? formatDate(pgrProfile.snapshot_date) : "Pas encore disponible"}
                  />
                  <Row label="Ranking externe" value={pgrExternalRanking(pgrProfile)} />
                </div>
              </Card>
            </>
          ) : (
            <Card padding="sm">
              <p className="text-sm font-medium text-onyx">Aucun profil PGR lié</p>
              <p className="mt-1 text-sm text-onyx-500">
                Lie ton profil PGR pour récupérer ton classement officiel.
              </p>
            </Card>
          )}
        </div>
      )}

      {tab === "Matériel" && (
        <div className="space-y-3">
          {equipment ? (
            <Card>
              <CardTitle className="mb-3">Matériel actif</CardTitle>
              <div className="space-y-2 text-sm">
                <Row label="Bois" value={equipment.blade || "-"} />
                <Row label="CD" value={[equipment.rubber_fh, equipment.thickness_fh && `${equipment.thickness_fh}mm`].filter(Boolean).join(" ") || "-"} />
                <Row label="RV" value={[equipment.rubber_bh, equipment.thickness_bh && `${equipment.thickness_bh}mm`].filter(Boolean).join(" ") || "-"} />
                <Row label="Depuis" value={formatDate(equipment.started_at)} />
              </div>
            </Card>
          ) : (
            <Card padding="sm">
              <p className="text-sm text-onyx-500">Aucun matériel actif enregistré.</p>
            </Card>
          )}
          <Link href="/equipment">
            <Button variant="outline" fullWidth icon={Wrench}>
              Gérer le matériel
            </Button>
          </Link>
        </div>
      )}

      {tab === "Badges" && (
        <div className="grid grid-cols-3 gap-2">
          {badges.length > 0 ? (
            badges.slice(0, 9).map((badge) => (
              <Card key={badge.id} padding="sm" className="text-center">
                <div className="text-2xl mb-1">★</div>
                <p className="text-[10px] font-medium text-onyx leading-tight">{formatBadgeType(badge.badge_type)}</p>
              </Card>
            ))
          ) : (
            <Card padding="sm" className="col-span-3">
              <p className="text-sm text-onyx-500">Aucun badge personnel obtenu.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function formatBadgeType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm" className="text-center">
      <p className="font-heading font-bold text-xl text-onyx">{value}</p>
      <p className="text-xs text-onyx-400 mt-0.5">{label}</p>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-onyx-50 last:border-0">
      <span className="text-onyx-400">{label}</span>
      <span className="font-medium text-onyx text-right">{value}</span>
    </div>
  )
}
