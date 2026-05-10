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
    <div className="flex flex-col min-h-screen bg-black">
      {/* TOP — hero 55% */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col justify-end px-6 pt-16 pb-10"
        style={{ minHeight: "55vh" }}
      >
        <div className="font-display font-light text-white leading-[0.82]" style={{ fontSize: "88px" }}>
          PING<br />TRACK
        </div>
        <div className="w-12 h-[2px] bg-green-light mt-8 mb-5" />
        <div className="text-[10px] text-sage uppercase tracking-[0.3em]">
          Performance · Progression · Analyse
        </div>
      </motion.div>

      {/* BOTTOM — form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="flex-1 flex flex-col px-6 border-t border-white/[0.06] pt-10 pb-12"
      >
        <div className="text-[9px] text-sage uppercase tracking-[0.3em] mb-8">Connexion</div>

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
            <p className="text-[11px] text-red border-l-2 border-red pl-3 py-1">{error}</p>
          )}

          <div className="flex justify-end -mt-3">
            <Link
              href="/forgot-password"
              className="text-[10px] text-sage hover:text-white transition-colors tracking-[0.1em] uppercase"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-1">
            Se connecter
          </Button>
        </form>

        <div className="mt-auto pt-12">
          <div className="h-px bg-white/[0.06] mb-8" />
          <p className="text-center text-[11px] text-sage tracking-[0.05em]">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="text-white hover:text-sage transition-colors underline underline-offset-4"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
