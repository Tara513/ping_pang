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
  password: z.string().min(6, "Minimum 6 caractères"),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) { setError("Email ou mot de passe incorrect"); return }
    router.push("/dashboard")
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
          <div className="text-[9px] text-sage uppercase tracking-[0.35em]">Track your game</div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] text-sage uppercase tracking-[0.25em] font-sans">Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="ton@email.com"
              className="w-full bg-transparent border-b border-white/15 focus:border-white/50 py-2.5 text-sm text-white font-sans placeholder:text-white/20 outline-none transition-colors"
              {...register("email")}
            />
            {errors.email && <p className="text-[11px] text-red font-sans">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] text-sage uppercase tracking-[0.25em] font-sans">Mot de passe</label>
              <Link href="/forgot-password" className="text-[9px] text-sage/50 hover:text-sage font-sans transition-colors">
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
              : <><span>Se connecter</span><ArrowRight size={15} strokeWidth={1.5} /></>}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[9px] text-white/20 font-sans uppercase tracking-widest">ou</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <p className="text-center text-sm text-sage font-sans">
          Pas de compte ?{" "}
          <Link href="/register" className="text-white hover:text-cream transition-colors">
            Créer un compte
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
