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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="font-display font-light text-white leading-none mb-1" style={{ fontSize: "56px" }}>
            Ping
          </div>
          <div className="text-[9px] text-sage uppercase tracking-[0.35em]">Rejoins la communauté</div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] text-sage uppercase tracking-[0.25em] font-sans">Email</label>
            <input
              type="email" autoComplete="email" placeholder="ton@email.com"
              className="w-full bg-transparent border-b border-white/15 focus:border-white/50 py-2.5 text-sm text-white font-sans placeholder:text-white/20 outline-none transition-colors"
              {...register("email")}
            />
            {errors.email && <p className="text-[11px] text-red font-sans">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] text-sage uppercase tracking-[0.25em] font-sans">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} autoComplete="new-password"
                placeholder="Minimum 8 caractères"
                className="w-full bg-transparent border-b border-white/15 focus:border-white/50 py-2.5 pr-10 text-sm text-white font-sans placeholder:text-white/20 outline-none transition-colors"
                {...register("password")}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-sage transition-colors">
                {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-red font-sans">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] text-sage uppercase tracking-[0.25em] font-sans">Confirmer le mot de passe</label>
            <input
              type="password" autoComplete="new-password" placeholder="••••••••"
              className="w-full bg-transparent border-b border-white/15 focus:border-white/50 py-2.5 text-sm text-white font-sans placeholder:text-white/20 outline-none transition-colors"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className="text-[11px] text-red font-sans">{errors.confirmPassword.message}</p>}
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-red font-sans text-center border border-red/20 px-4 py-3">
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={isSubmitting}
            className="w-full mt-2 bg-white hover:bg-cream text-black font-sans text-xs uppercase tracking-[0.2em] py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            {isSubmitting
              ? <Loader2 size={16} className="animate-spin" />
              : <><span>Créer mon compte</span><ArrowRight size={15} strokeWidth={1.5} /></>}
          </button>
        </form>

        <p className="text-[9px] text-white/20 text-center mt-6 font-sans leading-relaxed">
          En créant un compte tu acceptes nos <span className="underline cursor-pointer">CGU</span> et notre <span className="underline cursor-pointer">Politique de confidentialité</span>.
        </p>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[9px] text-white/20 font-sans uppercase tracking-widest">ou</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <p className="text-center text-sm text-sage font-sans">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-white hover:text-cream transition-colors">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
