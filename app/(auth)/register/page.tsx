"use client"

export const dynamic = "force-dynamic"


import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
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
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    })
    if (error) {
      setError(error.message)
      return
    }
    router.push("/onboarding")
  }

  return (
    <div className="flex flex-col min-h-screen bg-black px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 pb-12"
      >
        <div className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-kaki flex items-center justify-center">
            <span className="text-white text-lg">🏓</span>
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
        <h1 className="font-display text-4xl text-white uppercase mb-2">Créer un compte</h1>
        <p className="text-olive text-sm mb-8">Rejoins la communauté PingTrack</p>

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
            autoComplete="new-password"
            placeholder="Minimum 8 caractères"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {error && (
            <p className="text-sm text-red bg-red/10 border border-red/20 px-4 py-3">{error}</p>
          )}

          <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-2">
            Créer mon compte
          </Button>
        </form>

        <p className="text-[10px] text-olive text-center mt-4">
          En créant un compte, tu acceptes nos Conditions d&apos;utilisation et notre Politique de confidentialité.
        </p>

        <div className="mt-auto pb-10 pt-8">
          <p className="text-center text-sm text-olive">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-white font-semibold hover:text-kaki transition-colors underline underline-offset-2">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
