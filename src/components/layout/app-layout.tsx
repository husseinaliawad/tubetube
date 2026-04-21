'use client'

import { TopBar } from './topbar'
import { BottomNav } from './bottom-nav'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060607] text-white">
      <TopBar />
      <main className="min-h-screen px-3 pb-[94px] pt-[122px] md:px-6 md:pt-[86px]">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_35%),linear-gradient(180deg,#0a0a0b_0%,#060607_45%,#050506_100%)]" />
        <div className="mx-auto max-w-7xl min-h-[calc(100vh-186px)] rounded-2xl border border-white/10 bg-[#0e1013]/92 px-4 py-5 backdrop-blur-sm md:px-6 md:py-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
