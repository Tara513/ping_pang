"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import PageWrapper from "@/components/layout/PageWrapper"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import type { Profile } from "@/types/database"

const LEVEL_OPTIONS = [
  { value: "beginner",     label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced",     label: "Avancé" },
  { value: "competitive",  label: "Compétiteur" },
  { value: "elite",        label: "Elite" },
]

const STYLE_OPTIONS = [
  { value: "attacker",  label: "Attaquant" },
  { value: "defender",  label: "Défenseur" },
  { value: "allround",  label: "Polyvalent" },
  { value: "penhold",   label: "Penholder" },
  { value: "other",     label: "Autre" },
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (data) setProfile(data)
    }
    load()
  }, [supabase])

  const save = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...profile })
    if (error) toast("Erreur lors de la sauvegarde", "error")
    else toast("Profil mis à jour !", "success")
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <>
      <TopBar title="Paramètres" showBack />
      <PageWrapper noPadding>
        <div className="px-4 py-6 flex flex-col gap-8">
          {/* Identité */}
          <div>
            <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-6">Identité</div>
            <div className="flex flex-col gap-6">
              <Input
                label="Nom complet"
                placeholder="Prénom Nom"
                value={profile.full_name || ""}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
              />
              <Input
                label="Nom d'utilisateur"
                placeholder="@username"
                value={profile.username || ""}
                onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
              />
              <Textarea
                label="Bio"
                placeholder="Parle de toi, ton style, tes objectifs..."
                value={profile.bio || ""}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Localisation */}
          <div>
            <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-6">Localisation</div>
            <div className="flex flex-col gap-6">
              <Input
                label="Ville"
                placeholder="Paris"
                value={profile.city || ""}
                onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
              />
              <Input
                label="Club"
                placeholder="Nom du club"
                value={profile.club || ""}
                onChange={(e) => setProfile((p) => ({ ...p, club: e.target.value }))}
              />
            </div>
          </div>

          {/* Niveau */}
          <div>
            <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-3">Niveau</div>
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setProfile((p) => ({ ...p, level: opt.value as Profile["level"] }))}
                className={`w-full flex items-center gap-4 py-3.5 border-b border-white/[0.05] text-left transition-all ${
                  profile.level === opt.value ? "" : "hover:bg-white/[0.01]"
                }`}
              >
                <div className={`w-[3px] self-stretch flex-shrink-0 ${
                  profile.level === opt.value ? "bg-green-light" : "bg-white/10"
                }`} />
                <div className={`font-sans text-sm transition-colors ${
                  profile.level === opt.value ? "text-white" : "text-sage"
                }`}>{opt.label}</div>
                {profile.level === opt.value && (
                  <div className="ml-auto text-[9px] text-green-light">✓</div>
                )}
              </button>
            ))}
          </div>

          {/* Style */}
          <div>
            <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-3">Style de jeu</div>
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setProfile((p) => ({ ...p, play_style: opt.value as Profile["play_style"] }))}
                className={`w-full flex items-center gap-4 py-3.5 border-b border-white/[0.05] text-left transition-all ${
                  profile.play_style === opt.value ? "" : "hover:bg-white/[0.01]"
                }`}
              >
                <div className={`w-[3px] self-stretch flex-shrink-0 ${
                  profile.play_style === opt.value ? "bg-green-light" : "bg-white/10"
                }`} />
                <div className={`font-sans text-sm transition-colors ${
                  profile.play_style === opt.value ? "text-white" : "text-sage"
                }`}>{opt.label}</div>
                {profile.play_style === opt.value && (
                  <div className="ml-auto text-[9px] text-green-light">✓</div>
                )}
              </button>
            ))}
          </div>

          {/* Mode coach */}
          <div>
            <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-3">Options</div>
            <div className="flex items-center justify-between py-4 border-b border-white/[0.05]">
              <div>
                <div className="text-sm text-white font-sans">Mode coach</div>
                <div className="text-[10px] text-sage mt-0.5">Commenter les séances des joueurs</div>
              </div>
              <button
                onClick={() => setProfile((p) => ({ ...p, is_coach: !p.is_coach }))}
                className={`w-11 h-6 relative transition-colors flex-shrink-0 ${profile.is_coach ? "bg-green-light" : "bg-white/15"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white transition-all duration-200 ${profile.is_coach ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          {/* Save */}
          <Button onClick={save} loading={loading} fullWidth size="lg">
            Sauvegarder les modifications
          </Button>

          {/* Sign out */}
          <div className="pt-4 border-t border-white/[0.06]">
            <button
              onClick={signOut}
              className="w-full text-center text-[11px] text-sage/50 hover:text-red transition-colors uppercase tracking-[0.2em] py-3"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
