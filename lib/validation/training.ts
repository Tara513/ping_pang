import { z } from "zod"

export const sessionTypeSchema = z.enum([
  "technique",
  "physique",
  "match",
  "service",
  "competition",
  "chill",
])

export const matchTypeSchema = z.enum(["friendly", "league", "tournament", "training"])

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide")

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null))

const ratingSchema = z.number().int().min(1).max(5).nullable().optional()

export const createTrainingSessionSchema = z.object({
  session_type: sessionTypeSchema,
  duration_min: z.number().int().min(1).max(720),
  date: isoDateSchema,
  location: optionalText(160),
  notes: optionalText(4000),
  exercises: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(160),
        notes: optionalText(1000).optional(),
      })
    )
    .max(50)
    .default([]),
  feeling: ratingSchema,
  fatigue: ratingSchema,
  motivation: ratingSchema,
  confidence: ratingSchema,
  has_description: z.boolean().default(false),
})

export const createPersonalMatchSchema = z.object({
  opponent_name: z.string().trim().min(1, "Nom de l'adversaire requis").max(160),
  match_type: matchTypeSchema,
  date: isoDateSchema,
  location: optionalText(160),
  notes: optionalText(4000),
  sets: z
    .array(
      z.object({
        player: z.number().int().min(0).max(99),
        opponent: z.number().int().min(0).max(99),
      })
    )
    .min(1, "Renseigne au moins un set")
    .max(7, "Maximum 7 sets"),
}).superRefine((value, ctx) => {
  let won = 0
  let lost = 0

  value.sets.forEach((set, index) => {
    if (set.player === set.opponent) {
      ctx.addIssue({
        code: "custom",
        path: ["sets", index],
        message: "Un set ne peut pas finir à égalité",
      })
      return
    }
    if (set.player > set.opponent) won += 1
    else lost += 1
  })

  if (won === lost) {
    ctx.addIssue({
      code: "custom",
      path: ["sets"],
      message: "Le score doit déterminer une victoire ou une défaite",
    })
  }
})

export const updateTrainingProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{2,32}$/, "Nom d'utilisateur invalide"),
  full_name: optionalText(120),
  bio: optionalText(500),
  country: optionalText(80).default("FR"),
  city: optionalText(120),
  club: optionalText(160),
  play_style: z.enum(["attacker", "defender", "allround", "penhold", "other"]).nullable().optional(),
  dominant_hand: z.enum(["right", "left"]).nullable().optional(),
  level: z.enum(["beginner", "intermediate", "advanced", "competitive", "elite"]).nullable().optional(),
})

export const completeTrainingOnboardingSchema = updateTrainingProfileSchema.extend({
  skip_equipment: z.boolean().optional(),
  blade: optionalText(160),
  rubber_fh: optionalText(160),
  rubber_bh: optionalText(160),
  thickness_fh: z.number().min(0.5).max(5).nullable().optional(),
  thickness_bh: z.number().min(0.5).max(5).nullable().optional(),
  target_hours: z.number().min(1).max(40).nullable().optional(),
  target_sessions: z.number().int().min(1).max(14).nullable().optional(),
})
