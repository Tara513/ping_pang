'use client'

import { cn } from '@/lib/utils/cn'

interface SliderProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  showValue?: boolean
  className?: string
}

export function Slider({ label, value, min = 0, max = 100, step = 1, onChange, showValue = true, className }: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-onyx-600">{label}</label>
        {showValue && (
          <span className="text-sm font-semibold text-onyx tabular-nums">{value}</span>
        )}
      </div>
      <div className="relative h-5 flex items-center">
        <div className="w-full h-1.5 rounded-full bg-onyx-100 relative">
          <div
            className="h-full rounded-full bg-evergreen transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute size-4 rounded-full bg-evergreen border-2 border-white shadow-sm transition-all"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>
    </div>
  )
}
