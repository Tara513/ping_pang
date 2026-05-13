import { cn } from '@/lib/utils/cn'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizes: Record<AvatarSize, string> = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
  xl: 'size-20 text-xl',
}

interface AvatarProps {
  name: string
  src?: string
  size?: AvatarSize
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0 overflow-hidden select-none',
        'bg-evergreen text-lime',
        sizes[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}
