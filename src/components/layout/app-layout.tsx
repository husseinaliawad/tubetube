'use client'

import { TopBar } from './topbar'
import { BottomNav } from './bottom-nav'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#e5ebf1] text-slate-950">
      <TopBar />
      <main className="min-h-screen px-4 pb-[90px] pt-[74px] md:px-5">
        <div className="mx-auto max-w-[1600px]">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
