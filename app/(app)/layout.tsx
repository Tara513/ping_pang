import AppChrome from "@/components/layout/AppChrome"
import { ToastProvider } from "@/components/ui/Toast"
import type { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppChrome>{children}</AppChrome>
    </ToastProvider>
  )
}
