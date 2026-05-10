"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle } from "lucide-react"

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
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-50 flex flex-col gap-2 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-center gap-3 p-4 pointer-events-auto border ${
                t.type === "success"
                  ? "bg-green border-green/50 text-white"
                  : "bg-red border-red/50 text-white"
              }`}
            >
              {t.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-sans flex-1">{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((i) => i.id !== t.id))}
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
