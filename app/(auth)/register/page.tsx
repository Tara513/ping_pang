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
    <div className="flex flex-col min-h-screen">
      {/* Hero — vert forêt PPP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-ppp-forest px-6 pt-14 pb-10"
      >
        <div className="mb-6">
          <div className="text-[9px] text-ppp-white/40 uppercase tracking-[0.2em] font-serif mb-4">
            Ping Pang Paris
          </div>
          <div className="font-serif font-bold text-[3.5rem] text-ppp-white uppercase leading-[0.9] tracking-[0.02em]">
            Ping<br />Track
          </div>
          <div className="mt-3 inline-flex items-center gap-2 border border-ppp-white/20 px-3 py-1">
            <span className="text-[9px] text-ppp-white/50 uppercase tracking-[0.15em] font-serif">
              Rejoins la communauté
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="border-t border-ppp-white/15 pt-6"
        >
          <h1 className="font-serif text-3xl text-ppp-white uppercase tracking-[0.08em] leading-none">
            Créer un compte
          </h1>
        </motion.div>
      </motion.div>

      {/* Formulaire — fond crème */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="flex-1 bg-ppp-bg px-6 pt-10 pb-safe flex flex-col"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
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
            <p className="text-sm text-red bg-red/8 border border-red/20 px-4 py-3 font-serif">
              {error}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} fullWidth size="lg">
            Créer mon compte →
          </Button>
        </form>

        <p className="text-[10px] text-ppp-muted text-center mt-5 font-serif leading-relaxed">
          En créant un compte, tu acceptes nos{" "}
          <span className="underline underline-offset-2">Conditions d&apos;utilisation</span>{" "}
          et notre{" "}
          <span className="underline underline-offset-2">Politique de confidentialité</span>.
        </p>

        <div className="mt-auto pb-10 pt-8">
          <div className="h-px bg-ppp-border mb-8" />
          <p className="text-center text-sm text-ppp-muted font-serif">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-ppp-text font-semibold hover:text-ppp-forest transition-colors underline underline-offset-4 decoration-ppp-border"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
