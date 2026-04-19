'use client'

import { TopBar } from './topbar'
import { BottomNav } from './bottom-nav'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <TopBar />
      <main className="pt-[70px] pb-[90px] px-4 md:px-6 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
