import { cn } from '@/lib/utils/cn'
import { type InputHTMLAttributes, forwardRef } from 'react'
import { type LucideIcon } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: LucideIcon
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  icon: Icon,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-onyx-600">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-onyx-400">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 rounded-[8px] border border-onyx-200 bg-white px-3 text-sm text-onyx',
            'placeholder:text-onyx-400',
            'focus:outline-none focus:border-evergreen focus:ring-2 focus:ring-evergreen/10',
            'disabled:bg-onyx-50 disabled:cursor-not-allowed',
            Icon && 'pl-9',
            error && 'border-mauve focus:border-mauve focus:ring-mauve/10',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-mauve">{error}</p>}
      {hint && !error && <p className="text-xs text-onyx-400">{hint}</p>}
    </div>
  )
})

Input.displayName = 'Input'
