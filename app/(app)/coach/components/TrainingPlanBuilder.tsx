"use client"

import Link from "next/link"
import { useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle } from "@/components/ui/Card"
import { ClipboardList, RotateCcw, Save } from "lucide-react"
import type { CoachData, PlanDuration, PlanIntensity, TrainingPlanDraft } from "../types"
import { TrainingPlanPreview } from "./TrainingPlanPreview"

const durations: Array<{ label: string; value: PlanDuration }> = [
  { label: "1 semaine", value: 1 },
  { label: "2 semaines", value: 2 },
  { label: "4 semaines", value: 4 },
]

const intensities: Array<{ label: string; value: PlanIntensity }> = [
  { label: "Léger", value: "light" },
  { label: "Normal", value: "normal" },
  { label: "Intensif", value: "intensive" },
]

export function TrainingPlanBuilder({
  data,
  onPlanSaved,
}: {
  data: CoachData
  onPlanSaved?: (title: string | null) => void
}) {
  const [duration, setDuration] = useState<PlanDuration>(2)
  const [intensity, setIntensity] = useState<PlanIntensity>("normal")
  const [draft, setDraft] = useState<TrainingPlanDraft | null>(null)
  const [savedPlanTitle, setSavedPlanTitle] = useState<string | null>(data.draftProgram?.title ?? null)
  const [savedPlanId, setSavedPlanId] = useState<string | null>(data.draftProgram?.id ?? null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generatePreview() {
    setPreviewLoading(true)
    setError(null)
    setSavedPlanTitle(null)
    try {
      const response = await fetch("/api/coach/training-plan/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration_weeks: duration, intensity }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const message = payload?.reason ? `${payload.error}: ${payload.reason}` : payload?.error
        throw new Error(message || "Génération impossible")
      }
      setDraft(payload.plan as TrainingPlanDraft)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Génération impossible")
    } finally {
      setPreviewLoading(false)
    }
  }

  async function saveDraft() {
    if (!draft) return
    setSaveLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/coach/training-plan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: draft }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || "Sauvegarde impossible")
      setSavedPlanTitle(payload?.program?.title || draft.title)
      setSavedPlanId(payload?.program?.id || null)
      onPlanSaved?.(payload?.program?.title || draft.title)
      setDraft(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sauvegarde impossible")
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>Plan d&apos;entraînement</CardTitle>
          <p className="text-sm text-onyx-400">Prévisualise avant de sauvegarder.</p>
        </div>
        {savedPlanTitle && <Badge variant="success">Plan brouillon sauvegardé</Badge>}
      </div>

      <div className="rounded-[8px] bg-onyx-50 p-3 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-onyx-400">Sources utilisées</p>
        <p className="text-sm text-onyx-600">
          {data.matches.length} match{data.matches.length > 1 ? "s" : ""} récent{data.matches.length > 1 ? "s" : ""} · {data.analyses.length} analyse{data.analyses.length > 1 ? "s" : ""} · objectif hebdo {data.weeklyGoal ? "renseigné" : "absent"} · PGR {data.pgrProfile ? "lié" : "absent"}
        </p>
      </div>

      <div className="space-y-3">
        <Segmented label="Durée" options={durations} value={duration} onChange={setDuration} />
        <Segmented label="Intensité" options={intensities} value={intensity} onChange={setIntensity} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" icon={ClipboardList} loading={previewLoading} onClick={generatePreview} fullWidth>
          Générer un brouillon
        </Button>
        {draft && (
          <Button variant="primary" icon={Save} loading={saveLoading} onClick={saveDraft} fullWidth>
            Sauvegarder
          </Button>
        )}
      </div>

      {savedPlanTitle && !draft && (
        <div className="rounded-[8px] border border-evergreen/20 bg-evergreen/5 p-3">
          <p className="break-words text-sm font-medium text-evergreen">Plan brouillon sauvegardé : {savedPlanTitle}</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Link href={savedPlanId ? `/coach/programs/${savedPlanId}` : "/coach/programs"} className="text-sm font-medium text-onyx underline">
              Voir mon plan
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium text-onyx-500"
              onClick={() => {
                setSavedPlanTitle(null)
                setSavedPlanId(null)
                onPlanSaved?.(null)
              }}
            >
              <RotateCcw size={14} />
              Générer une nouvelle version
            </button>
          </div>
        </div>
      )}

      {draft && <TrainingPlanPreview plan={draft} />}
      {error && <p className="text-sm text-mauve">{error}</p>}
    </Card>
  )
}

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ label: string; value: T }>
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-onyx-400 mb-2">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-[8px] border px-2 py-2 text-sm font-medium transition-colors ${
              value === option.value
                ? "border-evergreen bg-evergreen text-pp-white"
                : "border-onyx-100 bg-white text-onyx-600"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
