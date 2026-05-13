import { cn } from '@/lib/utils/cn'
import { type HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'lime' | 'blue'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-onyx-100 text-onyx-600',
  success: 'bg-[#e8f5e9] text-[#2e7d32]',
  warning: 'bg-[#fff8e1] text-[#e65100]',
  danger: 'bg-mauve-light text-mauve',
  info: 'bg-blue-pp/20 text-blue-pp-dark',
  outline: 'border border-onyx-200 text-onyx-600 bg-transparent',
  lime: 'bg-lime text-evergreen',
  blue: 'bg-blue-pp text-evergreen',
}

export function Badge({ variant = 'default', size = 'sm', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
