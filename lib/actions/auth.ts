"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { ensureSharedProfile } from "@/lib/data/shared-profile"

const emailSchema = z.string().trim().email("Email invalide").max(254)
const passwordSchema = z.string().min(8, "Mot de passe trop court").max(128)
const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{2,32}$/, "Nom d'utilisateur invalide")

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function authError(path: "/login" | "/register", message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function signInWithPassword(formData: FormData) {
  const email = emailSchema.safeParse(getString(formData, "email"))
  const password = z.string().min(1).safeParse(getString(formData, "password"))

  if (!email.success || !password.success) {
    authError("/login", "Email ou mot de passe invalide")
  }

  const emailValue = email.data as string
  const passwordValue = password.data as string
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailValue,
    password: passwordValue,
  })

  if (error || !data.user) {
    authError("/login", "Identifiants incorrects")
  }

  const signedInUser = data.user
  if (!signedInUser) authError("/login", "Identifiants incorrects")

  await ensureSharedProfile(supabase, signedInUser)
  redirect("/dashboard")
}

export async function signUpWithPassword(formData: FormData) {
  const email = emailSchema.safeParse(getString(formData, "email"))
  const password = passwordSchema.safeParse(getString(formData, "password"))
  const username = usernameSchema.safeParse(getString(formData, "username"))
  const fullName = z.string().trim().max(120).safeParse(getString(formData, "full_name"))

  if (!email.success) authError("/register", email.error.issues[0]?.message || "Email invalide")
  if (!password.success) authError("/register", password.error.issues[0]?.message || "Mot de passe invalide")
  if (!username.success) authError("/register", username.error.issues[0]?.message || "Nom d'utilisateur invalide")
  if (!fullName.success) authError("/register", "Nom invalide")

  const emailValue = email.data as string
  const passwordValue = password.data as string
  const usernameValue = username.data as string
  const fullNameValue = fullName.data as string
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: emailValue,
    password: passwordValue,
    options: {
      data: {
        username: usernameValue,
        full_name: fullNameValue || null,
      },
    },
  })

  if (error || !data.user) {
    authError("/register", error?.message || "Impossible de créer le compte")
  }

  const createdUser = data.user
  if (!createdUser) authError("/register", "Impossible de créer le compte")

  if (data.session) {
    await ensureSharedProfile(supabase, createdUser)
    redirect("/onboarding")
  }

  redirect("/login?message=Compte créé. Vérifie tes emails si la confirmation est activée.")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
