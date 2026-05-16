import type { CoachMatch, CoachMatchAnalysis, CoachPageData } from "@/lib/data/coach"

export type CoachData = CoachPageData
export type CoachMatchItem = CoachMatch
export type CoachAnalysisItem = CoachMatchAnalysis

export type PlanDuration = 1 | 2 | 4
export type PlanIntensity = "light" | "normal" | "intensive"

export interface PlanExerciseDraft {
  name: string
  notes?: string
}

export interface PlanSessionDraft {
  week_number: number
  day_of_week: number
  session_type: "technique" | "physique" | "match" | "service" | "competition" | "chill"
  duration_min?: number | null
  objectives?: string | null
  exercises: PlanExerciseDraft[]
  notes?: string | null
}

export interface TrainingPlanDraft {
  title: string
  description: string
  main_objective?: string
  duration_weeks: number
  intensity?: PlanIntensity
  sessions: PlanSessionDraft[]
}
