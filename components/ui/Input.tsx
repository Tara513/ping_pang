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
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-olive uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent border text-white font-sans text-sm px-4 py-3",
            "placeholder:text-olive/50 outline-none transition-colors",
            error
              ? "border-red focus:border-red"
              : "border-white/25 focus:border-olive",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red">{error}</p>}
        {hint && !error && <p className="text-xs text-olive">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
export default Input
