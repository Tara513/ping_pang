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
          <label htmlFor={textareaId} className="text-[10px] font-serif uppercase tracking-[0.1em] text-ppp-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
          className={cn(
            "w-full bg-transparent border-0 border-b text-ppp-text font-serif text-sm px-0 py-3",
            "placeholder:text-ppp-muted/50 outline-none transition-colors resize-none",
            error
              ? "border-red focus:border-red"
              : "border-ppp-border focus:border-ppp-text",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red font-serif">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"
export default Textarea
