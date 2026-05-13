import { cn } from '@/lib/utils/cn'
import { type LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void; icon?: LucideIcon }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {Icon && (
        <div className="size-14 rounded-full bg-onyx-50 flex items-center justify-center mb-4">
          <Icon size={24} className="text-onyx-400" />
        </div>
      )}
      <h3 className="font-heading font-semibold text-onyx text-base mb-1.5">{title}</h3>
      {description && <p className="text-sm text-onyx-400 max-w-[280px] mb-4">{description}</p>}
      {action && (
        <Button variant="primary" size="sm" icon={action.icon} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
