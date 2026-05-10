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
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-sage uppercase tracking-wider">{label}</label>
        <span className="font-display text-2xl text-white leading-none">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-green h-1 bg-white/20 rounded-none cursor-pointer"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between">
          <span className="text-[10px] text-sage">{minLabel}</span>
          <span className="text-[10px] text-sage">{maxLabel}</span>
        </div>
      )}
    </div>
  )
}
