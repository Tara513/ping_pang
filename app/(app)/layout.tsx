import type { ReactNode } from "react"
import BottomNav from "@/components/layout/BottomNav"
import { ToastProvider } from "@/components/ui/Toast"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {/* Contenu avec padding-bottom pour ne pas passer sous la nav fixe */}
      <div className="min-h-dvh bg-black pb-16">
        {children}
      </div>
      <BottomNav />
    </ToastProvider>
  )
}
