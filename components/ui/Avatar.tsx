import Image from "next/image"
import { cn } from "@/lib/utils/cn"

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizes = {
  xs: "h-7 w-7 text-xs",
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
}

const pxSizes = { xs: 28, sm: 36, md: 48, lg: 64, xl: 96 }

export default function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initial = name?.trim()?.charAt(0).toUpperCase() || "P"

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-ppp-forest text-black",
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name || "Avatar"}
          fill
          className="object-cover"
          sizes={`${pxSizes[size]}px`}
        />
      ) : (
        <span className="font-bold">{initial}</span>
      )}
    </div>
  )
}
