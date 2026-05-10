import type { ReactNode } from "react"
import BottomNav from "@/components/layout/BottomNav"
import { ToastProvider } from "@/components/ui/Toast"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-ppp-bg">
        {children}
        <BottomNav />
      </div>
    </ToastProvider>
  )
}
