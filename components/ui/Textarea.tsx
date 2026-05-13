"use client"

import { cn } from "@/lib/utils/cn"
import { forwardRef, type TextareaHTMLAttributes } from "react"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold uppercase tracking-[0.08em] text-ppp-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
          className={cn(
            "focus-ring min-h-28 w-full resize-none rounded-lg border bg-ppp-surface px-3.5 py-3 text-sm text-ppp-text outline-none transition",
            "placeholder:text-ppp-muted/55",
            error ? "border-red focus:border-red" : "border-white/10 focus:border-ppp-forest",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export default Textarea
