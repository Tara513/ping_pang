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

export default function Slider({ label, value, onChange, min = 1, max = 5, minLabel, maxLabel, className }: SliderProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex justify-between items-baseline">
        <label className="text-[9px] text-sage uppercase tracking-[0.2em] font-sans">{label}</label>
        <span className="font-display font-light text-2xl text-white leading-none">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-white h-px bg-white/15 cursor-pointer"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between">
          <span className="text-[9px] text-sage/50 font-sans">{minLabel}</span>
          <span className="text-[9px] text-sage/50 font-sans">{maxLabel}</span>
        </div>
      )}
    </div>
  )
}
