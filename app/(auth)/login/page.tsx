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
              Track your game
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
            Connexion
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
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          {error && (
            <p className="text-sm text-red bg-red/8 border border-red/20 px-4 py-3 font-serif">
              {error}
            </p>
          )}

          <div className="flex justify-end -mt-2">
            <Link
              href="/forgot-password"
              className="text-[10px] text-ppp-muted hover:text-ppp-text transition-colors font-serif uppercase tracking-[0.08em]"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" loading={isSubmitting} fullWidth size="lg">
            Se connecter →
          </Button>
        </form>

        <div className="mt-auto pb-10 pt-10">
          <div className="h-px bg-ppp-border mb-8" />
          <p className="text-center text-sm text-ppp-muted font-serif">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="text-ppp-text font-semibold hover:text-ppp-forest transition-colors underline underline-offset-4 decoration-ppp-border"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
