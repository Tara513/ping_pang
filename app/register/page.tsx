import Link from "next/link"
import { Mail, Lock, User } from "lucide-react"
import { signUpWithPassword } from "@/lib/actions/auth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

interface RegisterPageProps {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams

  return (
    <main className="min-h-screen bg-pp-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <div className="size-10 rounded-[6px] bg-evergreen flex items-center justify-center mb-4">
            <span className="text-lime font-heading font-black text-base">PP</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-onyx">Créer un compte</h1>
          <p className="text-sm text-onyx-500 mt-1">
            Ce compte sera partagé par Training et Ranking via Supabase Auth.
          </p>
        </div>

        {params.error && (
          <div className="rounded-[8px] border border-mauve/30 bg-mauve-light px-3 py-2 text-sm text-mauve">
            {params.error}
          </div>
        )}

        <form action={signUpWithPassword} className="space-y-4">
          <Input name="full_name" label="Nom complet" autoComplete="name" required icon={User} />
          <Input
            name="username"
            label="Nom d'utilisateur"
            autoComplete="username"
            required
            pattern="[a-zA-Z0-9_]{2,32}"
            hint="Lettres, chiffres et underscore uniquement."
          />
          <Input name="email" type="email" label="Email" autoComplete="email" required icon={Mail} />
          <Input
            name="password"
            type="password"
            label="Mot de passe"
            autoComplete="new-password"
            minLength={8}
            required
            icon={Lock}
          />
          <Button type="submit" fullWidth>
            Créer le compte
          </Button>
        </form>

        <p className="text-sm text-onyx-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold text-evergreen">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
