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
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-sage uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
          className={cn(
            "w-full bg-transparent border text-white font-sans text-sm px-4 py-3",
            "placeholder:text-sage/50 outline-none transition-colors resize-none",
            error
              ? "border-red focus:border-red"
              : "border-white/25 focus:border-green",
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
