import { cn } from '@/lib/utils/cn'
import { ChevronDown } from 'lucide-react'
import { type SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  placeholder,
  className,
  id,
  ...props
}, ref) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-onyx-600">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full h-10 appearance-none rounded-[8px] border border-onyx-200 bg-white pl-3 pr-9 text-sm text-onyx',
            'focus:outline-none focus:border-evergreen focus:ring-2 focus:ring-evergreen/10',
            'disabled:bg-onyx-50 disabled:cursor-not-allowed',
            error && 'border-mauve',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-onyx-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-mauve">{error}</p>}
    </div>
  )
})

Select.displayName = 'Select'
