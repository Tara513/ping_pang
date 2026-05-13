"use client"

import { cn } from "@/lib/utils/cn"
import { Loader2 } from "lucide-react"
import { forwardRef, type ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "soft"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "border-ppp-forest bg-ppp-forest text-black shadow-[0_16px_36px_rgba(39,179,106,0.22)] hover:bg-[#38d681]",
      secondary:
        "border-white/12 bg-white text-black hover:bg-ppp-gold",
      ghost:
        "border-transparent bg-transparent text-ppp-muted hover:bg-white/6 hover:text-ppp-text",
      danger:
        "border-red bg-red text-white hover:bg-red/85",
      outline:
        "border-white/12 bg-transparent text-ppp-text hover:border-ppp-forest hover:text-ppp-forest",
      soft:
        "border-ppp-forest/20 bg-ppp-forest/12 text-ppp-forest hover:bg-ppp-forest/18",
    }

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-4 text-sm",
      lg: "h-13 px-5 text-base",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "focus-ring inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition duration-200 active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export default Button
