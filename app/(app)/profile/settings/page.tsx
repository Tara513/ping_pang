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
import { LogOut } from "lucide-react"

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
      <PageWrapper>
        <div className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-light text-white">Mon profil</h2>
            <Input
              label="Nom complet"
              value={profile.full_name || ""}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
            />
            <Input
              label="Nom d'utilisateur"
              value={profile.username || ""}
              onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
            />
            <Textarea
              label="Bio"
              placeholder="Parle de toi..."
              value={profile.bio || ""}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
            />
            <Input
              label="Ville"
              value={profile.city || ""}
              onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
            />
            <Input
              label="Club"
              value={profile.club || ""}
              onChange={(e) => setProfile((p) => ({ ...p, club: e.target.value }))}
            />
          </div>

          {/* Mode coach */}
          <div className="border border-white/[0.08] bg-surface p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Mode coach</div>
              <div className="text-xs text-sage mt-0.5">Commenter les séances de tes joueurs</div>
            </div>
            <button
              onClick={() => setProfile((p) => ({ ...p, is_coach: !p.is_coach }))}
              className={`w-12 h-6 relative transition-colors ${profile.is_coach ? "bg-green" : "bg-white/20"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white transition-all ${profile.is_coach ? "left-6" : "left-0.5"}`} />
            </button>
          </div>

          <Button onClick={save} loading={loading} fullWidth>
            Sauvegarder
          </Button>

          <div className="border-t border-white/[0.06] pt-6">
            <Button
              variant="danger"
              fullWidth
              onClick={signOut}
              className="flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Se déconnecter
            </Button>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
