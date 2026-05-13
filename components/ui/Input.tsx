"use client"

import { cn } from "@/lib/utils/cn"
import { forwardRef, type InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-[0.08em] text-ppp-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "focus-ring h-12 w-full rounded-lg border bg-ppp-surface px-3.5 text-sm text-ppp-text outline-none transition",
            "placeholder:text-ppp-muted/55",
            error ? "border-red focus:border-red" : "border-white/10 focus:border-ppp-forest",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red">{error}</p>}
        {hint && !error && <p className="text-xs text-ppp-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
