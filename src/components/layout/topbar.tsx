'use client'

import { useState } from 'react'
import { Play, Bell, CircleUserRound } from 'lucide-react'
import { useNavigation } from '@/store/navigation'

export function TopBar() {
  const { navigate } = useNavigation()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    navigate({ type: 'search', query: trimmed })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/15 bg-[#0f0f0f] px-3 py-3 md:px-5">
      <div className="mx-auto flex max-w-7xl items-center gap-3 md:gap-5">
        <button onClick={() => navigate({ type: 'home' })} className="flex items-center gap-2 shrink-0">
          <Play className="h-5 w-5 fill-red-600 text-red-600" />
          <span className="text-lg font-bold md:text-xl">
            <span className="text-red-600">xnaik</span> Tube
          </span>
        </button>

        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workout videos, HIIT, strength training..."
            className="w-full rounded-full border border-zinc-700 bg-[#121212] px-4 py-2 text-sm text-white placeholder:text-zinc-400 focus:border-red-600 focus:outline-none md:text-base"
          />
        </form>

        <div className="flex items-center gap-2 text-zinc-200 md:gap-3">
          <button
            onClick={() => navigate({ type: 'search', query: 'straight' })}
            className="rounded-full border border-red-500/70 bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-200 transition-colors hover:bg-red-600/35"
            title="Version 1 - Straight"
          >
            Straight
          </button>
          <button
            onClick={() => navigate({ type: 'search', query: 'gay' })}
            className="rounded-full border border-zinc-500 px-3 py-1 text-xs font-semibold text-zinc-200 transition-colors hover:border-red-500 hover:text-white"
            title="Version 1 - Gay"
          >
            Gay
          </button>
          <button onClick={() => navigate({ type: 'notifications' })} title="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <button onClick={() => navigate({ type: 'settings' })} title="Profile">
            <CircleUserRound className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
