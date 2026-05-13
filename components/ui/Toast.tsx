"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, CheckCircle2, X } from "lucide-react"

interface ToastItem {
  id: string
  message: string
  type: "success" | "error"
}

interface ToastContextValue {
  toast: (message: string, type?: "success" | "error") => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 3600)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-4 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-2xl ${
                item.type === "success"
                  ? "border-ppp-forest/30 bg-ppp-forest text-black"
                  : "border-red/30 bg-red text-white"
              }`}
            >
              {item.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="flex-1 text-sm font-semibold">{item.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((toastItem) => toastItem.id !== item.id))}
                className="focus-ring rounded p-1 opacity-70 transition hover:opacity-100"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
