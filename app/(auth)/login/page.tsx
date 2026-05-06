"use client"

export const dynamic = "force-dynamic"


import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Disc } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      setError("Email ou mot de passe incorrect")
      return
    }
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col min-h-screen bg-black px-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 pb-12"
      >
        <div className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-kaki flex items-center justify-center">
            <Disc size={20} strokeWidth={1.5} className="text-white" />
          </div>
          <div>
            <div className="font-display text-3xl text-white uppercase leading-none">PingTrack</div>
            <div className="text-[10px] text-olive uppercase tracking-widest">Track your game</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col"
      >
        <h1 className="font-display text-4xl text-white uppercase mb-8">Connexion</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="ton@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          {error && (
            <p className="text-sm text-red bg-red/10 border border-red/20 px-4 py-3">{error}</p>
          )}

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-olive hover:text-white transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-2">
            Se connecter
          </Button>
        </form>

        <div className="mt-auto pb-10 pt-8">
          <p className="text-center text-sm text-olive">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-white font-semibold hover:text-kaki transition-colors underline underline-offset-2">
              Créer un compte
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
