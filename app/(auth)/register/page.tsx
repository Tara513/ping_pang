"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    })
    if (error) { setError(error.message); return }
    router.push("/onboarding")
  }

  return (
    <div className="min-h-screen bg-ppp-forest flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.35)] overflow-hidden"
      >
        {/* Logo */}
        <div className="flex flex-col items-center pt-10 pb-8 px-8 border-b border-gray-100">
          <div className="text-5xl mb-4">🏓</div>
          <h1 className="font-serif font-bold text-3xl text-ppp-text uppercase tracking-[0.06em] leading-none">
            PingTrack
          </h1>
          <p className="text-[10px] text-ppp-muted uppercase tracking-[0.18em] font-serif mt-2">
            Rejoins la communauté
          </p>
        </div>

        {/* Formulaire */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-serif uppercase tracking-[0.14em] text-ppp-muted">Email</label>
              <input
                type="email" autoComplete="email" placeholder="ton@email.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-ppp-text font-serif placeholder:text-gray-300 outline-none focus:border-ppp-forest focus:bg-white transition-all"
                {...register("email")}
              />
              {errors.email && <p className="text-[11px] text-red font-serif">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-serif uppercase tracking-[0.14em] text-ppp-muted">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} autoComplete="new-password"
                  placeholder="Minimum 8 caractères"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-sm text-ppp-text font-serif placeholder:text-gray-300 outline-none focus:border-ppp-forest focus:bg-white transition-all"
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-ppp-muted transition-colors">
                  {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red font-serif">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-serif uppercase tracking-[0.14em] text-ppp-muted">Confirmer le mot de passe</label>
              <input
                type="password" autoComplete="new-password" placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-ppp-text font-serif placeholder:text-gray-300 outline-none focus:border-ppp-forest focus:bg-white transition-all"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-[11px] text-red font-serif">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-red font-serif text-center bg-red/5 border border-red/15 rounded-xl px-4 py-3">
                {error}
              </motion.p>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full mt-1 bg-ppp-forest hover:bg-ppp-forest-dark text-white font-serif text-sm uppercase tracking-[0.12em] rounded-xl py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50">
              {isSubmitting
                ? <Loader2 size={16} className="animate-spin" />
                : <><span>Créer mon compte</span><ArrowRight size={15} strokeWidth={2} /></>}
            </button>
          </form>

          <p className="text-[10px] text-gray-300 text-center mt-5 font-serif leading-relaxed">
            En créant un compte tu acceptes nos <span className="underline underline-offset-2 cursor-pointer">CGU</span> et notre <span className="underline underline-offset-2 cursor-pointer">Politique de confidentialité</span>.
          </p>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] text-gray-300 font-serif uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-ppp-muted font-serif">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-ppp-forest font-semibold hover:underline underline-offset-2">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
