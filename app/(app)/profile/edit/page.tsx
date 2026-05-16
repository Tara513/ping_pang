import { redirect } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card, CardTitle } from "@/components/ui/Card"
import { requireSharedProfile } from "@/lib/data/shared-profile"
import { updateTrainingProfile } from "@/lib/actions/training"

interface ProfileEditPageProps {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function ProfileEditPage({ searchParams }: ProfileEditPageProps) {
  const params = await searchParams
  const { profile } = await requireSharedProfile()

  async function saveProfile(formData: FormData) {
    "use server"

    const result = await updateTrainingProfile({
      full_name: formData.get("full_name"),
      username: formData.get("username"),
      country: formData.get("country"),
      city: formData.get("city"),
      club: formData.get("club"),
      level: formData.get("level") || null,
      play_style: formData.get("play_style") || null,
      dominant_hand: formData.get("dominant_hand") || null,
    })

    if (!result.ok) {
      redirect(`/profile/edit?error=${encodeURIComponent(result.error)}`)
    }

    redirect("/profile")
  }

  return (
    <form action={saveProfile} className="space-y-5">
      <h2 className="font-heading font-bold text-xl text-onyx">Modifier le profil</h2>

      {params.error && (
        <div className="rounded-[8px] border border-mauve/30 bg-mauve-light px-3 py-2 text-sm text-mauve">
          {params.error}
        </div>
      )}

      <Card>
        <CardTitle className="mb-4">Informations</CardTitle>
        <div className="space-y-4">
          <Input name="full_name" label="Nom complet" defaultValue={profile.full_name || ""} />
          <Input name="username" label="Nom d'utilisateur" defaultValue={profile.username} required />
          <Input name="country" label="Pays" defaultValue={profile.country || "FR"} />
          <Input name="city" label="Ville" defaultValue={profile.city || ""} />
          <Input name="club" label="Club" defaultValue={profile.club || ""} />
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Jeu</CardTitle>
        <div className="space-y-4">
          <Select
            name="level"
            label="Niveau"
            defaultValue={profile.level || ""}
            options={[
              { value: "", label: "Non renseigné" },
              { value: "beginner", label: "Débutant" },
              { value: "intermediate", label: "Intermédiaire" },
              { value: "advanced", label: "Avancé" },
              { value: "competitive", label: "Compétiteur" },
              { value: "elite", label: "Élite" },
            ]}
          />
          <Select
            name="play_style"
            label="Style de jeu"
            defaultValue={profile.play_style || ""}
            options={[
              { value: "", label: "Non renseigné" },
              { value: "attacker", label: "Attaquant" },
              { value: "allround", label: "Polyvalent" },
              { value: "defender", label: "Défenseur" },
              { value: "penhold", label: "Prise porte-plume" },
              { value: "other", label: "Autre" },
            ]}
          />
          <Select
            name="dominant_hand"
            label="Main dominante"
            defaultValue={profile.dominant_hand || ""}
            options={[
              { value: "", label: "Non renseigné" },
              { value: "right", label: "Droitier" },
              { value: "left", label: "Gaucher" },
            ]}
          />
        </div>
      </Card>

      <Button type="submit" variant="primary" fullWidth>
        Sauvegarder
      </Button>
    </form>
  )
}
