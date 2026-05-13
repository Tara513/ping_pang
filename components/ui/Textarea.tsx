import { cn } from '@/lib/utils/cn'
import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  className,
  id,
  ...props
}, ref) => {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-onyx-600">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          'w-full rounded-[8px] border border-onyx-200 bg-white px-3 py-2.5 text-sm text-onyx',
          'placeholder:text-onyx-400 resize-none',
          'focus:outline-none focus:border-evergreen focus:ring-2 focus:ring-evergreen/10',
          'disabled:bg-onyx-50 disabled:cursor-not-allowed',
          error && 'border-mauve',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-mauve">{error}</p>}
      {hint && !error && <p className="text-xs text-onyx-400">{hint}</p>}
    </div>
  )
})

Textarea.displayName = 'Textarea'
