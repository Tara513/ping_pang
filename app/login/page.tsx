import Link from "next/link"
import { Mail, Lock } from "lucide-react"
import { signInWithPassword } from "@/lib/actions/auth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

interface LoginPageProps {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <main className="min-h-screen bg-pp-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <div className="size-10 rounded-[6px] bg-evergreen flex items-center justify-center mb-4">
            <span className="text-lime font-heading font-black text-base">PP</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-onyx">Connexion</h1>
          <p className="text-sm text-onyx-500 mt-1">
            Utilise le même compte Supabase que dans Ranking.
          </p>
        </div>

        {(params.error || params.message) && (
          <div
            className={`rounded-[8px] border px-3 py-2 text-sm ${
              params.error
                ? "border-mauve/30 bg-mauve-light text-mauve"
                : "border-evergreen/20 bg-evergreen/5 text-evergreen"
            }`}
          >
            {params.error || params.message}
          </div>
        )}

        <form action={signInWithPassword} className="space-y-4">
          <Input name="email" type="email" label="Email" autoComplete="email" required icon={Mail} />
          <Input
            name="password"
            type="password"
            label="Mot de passe"
            autoComplete="current-password"
            required
            icon={Lock}
          />
          <Button type="submit" fullWidth>
            Se connecter
          </Button>
        </form>

        <p className="text-sm text-onyx-500">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold text-evergreen">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  )
}
