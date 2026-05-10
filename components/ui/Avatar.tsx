import Image from "next/image"
import { cn } from "@/lib/utils/cn"

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizes = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
}

const pxSizes = { xs: 28, sm: 36, md: 48, lg: 64, xl: 96 }

export default function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "?"

  return (
    <div
      className={cn(
        "relative overflow-hidden flex items-center justify-center bg-green flex-shrink-0",
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
        <span className="font-display text-white">{initial}</span>
      )}
    </div>
  )
}
