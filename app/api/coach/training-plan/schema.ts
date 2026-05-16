import { z } from "zod"

export const planDurationSchema = z.union([z.literal(1), z.literal(2), z.literal(4)])
export const planIntensitySchema = z.enum(["light", "normal", "intensive"])

export const generatedPlanSessionSchema = z.object({
  week_number: z.number().int().min(1).max(12),
  day_of_week: z.number().int().min(1).max(7),
  session_type: z.enum(["technique", "physique", "match", "service", "competition", "chill"]),
  duration_min: z.number().int().min(15).max(240).nullable().optional(),
  objectives: z.string().max(600).nullable().optional(),
  exercises: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        notes: z.string().max(400).optional(),
      })
    )
    .max(8)
    .default([]),
  notes: z.string().max(600).nullable().optional(),
})

export const generatedPlanSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1200),
  main_objective: z.string().min(3).max(500).optional(),
  duration_weeks: z.number().int().min(1).max(12),
  intensity: planIntensitySchema.optional(),
  sessions: z.array(generatedPlanSessionSchema).min(1).max(36),
})

export const planPreviewRequestSchema = z.object({
  duration_weeks: planDurationSchema.default(2),
  intensity: planIntensitySchema.default("normal"),
})

export const planSaveRequestSchema = z.object({
  plan: generatedPlanSchema,
})

export type GeneratedTrainingPlan = z.infer<typeof generatedPlanSchema>
export type PlanIntensity = z.infer<typeof planIntensitySchema>
