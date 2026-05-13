import { cn } from '@/lib/utils/cn'

interface ProgressBarProps {
  value: number // 0–100
  variant?: 'default' | 'lime' | 'blue' | 'red'
  size?: 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

const variantColors: Record<string, string> = {
  default: 'bg-evergreen',
  lime: 'bg-lime-dark',
  blue: 'bg-blue-pp-dark',
  red: 'bg-mauve',
}

export function ProgressBar({ value, variant = 'default', size = 'md', showLabel = false, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 rounded-full bg-onyx-100 overflow-hidden', size === 'sm' ? 'h-1' : 'h-1.5')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', variantColors[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-onyx-400 tabular-nums w-8 text-right">{Math.round(clamped)}%</span>
      )}
    </div>
  )
}
