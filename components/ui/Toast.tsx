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
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-[440px] px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className={`flex items-center gap-3 px-4 py-3.5 pointer-events-auto border font-sans text-sm ${
                t.type === "success"
                  ? "bg-green border-green-light text-white"
                  : "bg-black border-red text-red"
              }`}
            >
              {t.type === "success"
                ? <CheckCircle size={17} className="shrink-0" />
                : <AlertCircle size={17} className="shrink-0" />
              }
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((i) => i.id !== t.id))}
                className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
                aria-label="Fermer"
              >
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
