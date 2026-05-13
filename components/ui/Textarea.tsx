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
          <label htmlFor={textareaId} className="text-[9px] text-sage uppercase tracking-[0.25em] font-sans">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
          className={cn(
            "w-full bg-transparent border-b text-white font-sans text-sm px-0 py-2",
            "placeholder:text-white/20 outline-none transition-colors resize-none",
            error
              ? "border-red focus:border-red"
              : "border-white/15 focus:border-white/40",
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-red">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"
export default Textarea
