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
          <label htmlFor={inputId} className="text-[9px] text-sage uppercase tracking-[0.25em] font-sans">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent border-b text-white font-sans text-base px-0 py-2",
            "placeholder:text-white/20 outline-none transition-colors duration-200",
            error
              ? "border-red focus:border-red"
              : "border-white/15 focus:border-white/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-red border-l-2 border-red pl-2">{error}</p>}
        {hint && !error && <p className="text-[10px] text-sage/60">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
export default Input
