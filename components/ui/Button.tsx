'use client'

import { cn } from '@/lib/utils/cn'
import { type LucideIcon } from 'lucide-react'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  iconRight?: LucideIcon
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-evergreen text-pp-white hover:bg-evergreen-light active:scale-[0.98]',
  secondary: 'bg-lime text-evergreen hover:bg-[#d4f08a] active:scale-[0.98]',
  ghost: 'bg-transparent text-onyx hover:bg-onyx-50 active:scale-[0.98]',
  danger: 'bg-mauve text-white hover:bg-[#d13e3e] active:scale-[0.98]',
  outline: 'border border-onyx-200 bg-transparent text-onyx hover:bg-onyx-50 active:scale-[0.98]',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-[8px] transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        'focus-visible:outline-2 focus-visible:outline-evergreen focus-visible:outline-offset-2',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
    </button>
  )
})

Button.displayName = 'Button'
