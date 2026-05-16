import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  generateTrainingPlanPreview,
  logTrainingPlanGenerationError,
  TrainingPlanGenerationError,
} from "../helpers"
import { planPreviewRequestSchema } from "../schema"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 })
  }

  const parsed = planPreviewRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
  }

  try {
    const result = await generateTrainingPlanPreview(
      user.id,
      parsed.data.duration_weeks,
      parsed.data.intensity
    )

    if (!result.configured) {
      return NextResponse.json(result.payload, { status: result.status })
    }

    return NextResponse.json({
      plan: result.plan,
      model_used: result.model,
      saved: false,
    })
  } catch (error) {
    logTrainingPlanGenerationError(error)

    if (error instanceof TrainingPlanGenerationError) {
      return NextResponse.json(
        {
          error: "Plan IA invalide",
          reason: error.reason,
        },
        { status: 502 }
      )
    }

    console.error("[coach] training plan preview failed", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Plan IA invalide",
      },
      { status: 502 }
    )
  }
}
