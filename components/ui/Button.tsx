"use client"

import { cn } from "@/lib/utils/cn"
import { type ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, fullWidth, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-sans font-medium text-xs uppercase tracking-[0.15em] transition-colors duration-150 select-none"

    const variants = {
      primary:   "bg-white text-black hover:bg-cream active:opacity-90",
      secondary: "bg-green text-white hover:bg-green-light active:opacity-90",
      ghost:     "bg-transparent text-white hover:bg-white/5 active:opacity-90",
      danger:    "bg-red text-white hover:opacity-90 active:opacity-80",
      outline:   "border border-white/30 bg-transparent text-white hover:border-white active:opacity-90",
    }

    const sizes = {
      sm: "px-4 py-2",
      md: "px-6 py-3.5",
      lg: "px-8 py-5",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          (disabled || loading) && "opacity-40 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    )
  }
)

Button.displayName = "Button"
export default Button
