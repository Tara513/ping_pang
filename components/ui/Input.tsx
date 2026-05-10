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
          <label
            htmlFor={inputId}
            className="text-xs font-serif uppercase tracking-[0.05em] text-ppp-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent border-0 border-b text-ppp-text font-serif text-base px-0 py-3",
            "placeholder:text-ppp-muted outline-none transition-colors duration-200",
            error
              ? "border-red focus:border-red"
              : "border-ppp-border focus:border-ppp-text",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-serif text-red">{error}</p>}
        {hint && !error && <p className="text-xs font-serif text-ppp-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
export default Input
