"use client"

import { cn } from "@/lib/utils/cn"

interface SliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
  className?: string
}

export default function Slider({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  minLabel,
  maxLabel,
  className,
}: SliderProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-semibold uppercase tracking-[0.08em] text-ppp-muted">{label}</label>
        <span className="rounded-full border border-ppp-forest/25 bg-ppp-forest/12 px-2.5 py-1 text-sm font-bold text-ppp-forest">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-ppp-forest"
      />
      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between text-xs text-ppp-muted">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  )
}
