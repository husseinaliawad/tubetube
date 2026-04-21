'use client'

import { TopBar } from './topbar'
import { BottomNav } from './bottom-nav'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <TopBar />
      <main className="pt-[74px] pb-[94px] px-3 md:px-6 min-h-screen">
        <div className="mx-auto max-w-7xl min-h-[calc(100vh-180px)] rounded-2xl bg-white px-4 py-5 text-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] md:px-6 md:py-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
