import type { ReactNode } from "react"
import BottomNav from "@/components/layout/BottomNav"
import { ToastProvider } from "@/components/ui/Toast"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {/* Fond desktop visible en dehors du container */}
      <div className="min-h-screen bg-ppp-forest/8 sm:bg-ppp-card">
        {/* Container centré façon app mobile */}
        <div className="mx-auto w-full max-w-[480px] min-h-screen bg-ppp-bg relative sm:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_64px_rgba(0,0,0,0.1)]">
          {children}
          <BottomNav />
        </div>
      </div>
    </ToastProvider>
  )
}
