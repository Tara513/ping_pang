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
    <div className="flex flex-col min-h-screen bg-black">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col justify-end px-6 pt-14 pb-10"
        style={{ minHeight: "38vh" }}
      >
        <Link
          href="/login"
          className="text-[10px] text-sage uppercase tracking-[0.25em] hover:text-white transition-colors mb-8 self-start"
        >
          ← Retour
        </Link>
        <div className="font-display font-light text-white leading-[0.85]" style={{ fontSize: "72px" }}>
          NOUVEAU<br />JOUEUR
        </div>
        <div className="w-8 h-[2px] bg-green-light mt-7" />
      </motion.div>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 flex flex-col px-6 border-t border-white/[0.06] pt-10 pb-12"
      >
        <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-8">
          Informations de connexion
        </div>

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
            <p className="text-[11px] text-red border-l-2 border-red pl-3 py-1">{error}</p>
          )}

          <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-1">
            Créer mon compte
          </Button>
        </form>

        <p className="text-[10px] text-sage/40 text-center mt-6 leading-relaxed">
          En créant un compte, tu acceptes nos Conditions d&apos;utilisation<br />
          et notre Politique de confidentialité.
        </p>

        <div className="mt-auto pt-12">
          <div className="h-px bg-white/[0.06] mb-8" />
          <p className="text-center text-[11px] text-sage tracking-[0.05em]">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-white hover:text-sage transition-colors underline underline-offset-4"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
