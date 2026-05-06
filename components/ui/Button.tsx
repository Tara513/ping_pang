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
    const base = "inline-flex items-center justify-center font-sans font-semibold transition-all duration-150 tracking-wide uppercase text-sm no-select"

    const variants = {
      primary: "bg-white text-black hover:bg-kaki hover:text-white active:scale-95",
      secondary: "bg-kaki text-white hover:bg-olive active:scale-95",
      ghost: "bg-transparent text-white hover:bg-anthracite active:scale-95",
      danger: "bg-red text-white hover:opacity-90 active:scale-95",
      outline: "bg-transparent border border-white/25 text-white hover:border-white/60 active:scale-95",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-3",
      lg: "px-8 py-4 text-base",
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
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = "Button"
export default Button
