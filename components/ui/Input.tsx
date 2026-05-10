"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils/cn"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        {label && (
          <label className="text-[9px] text-sage uppercase tracking-[0.25em] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-transparent border-b border-white/15 text-white py-3 text-sm outline-none",
            "transition-colors duration-200",
            "focus:border-white/50 placeholder:text-white/15",
            error && "border-red focus:border-red",
            className
          )}
          {...props}
        />
        {error && <span className="text-[10px] text-red mt-1.5">{error}</span>}
        {hint && !error && <span className="text-[10px] text-sage/60 mt-1.5">{hint}</span>}
      </div>
    )
  }
)

Input.displayName = "Input"
export default Input
