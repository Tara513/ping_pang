import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

interface AppChromeProps {
  children: React.ReactNode
}

export function AppChrome({ children }: AppChromeProps) {
  return (
    <div className="min-h-screen bg-onyx-100 flex items-start justify-center">
      {/* Phone frame */}
      <div className="relative w-full max-w-[430px] min-h-screen bg-pp-white flex flex-col shadow-2xl">
        {/* Top bar */}
        <TopBar />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
          {children}
        </main>

        {/* Bottom nav — fixed inside the frame */}
        <BottomNav />
      </div>
    </div>
  )
}
