'use client'

import { useState } from 'react'
import { Play, Bell, CircleUserRound } from 'lucide-react'
import { useNavigation } from '@/store/navigation'

export function TopBar() {
  const { currentPage, navigate } = useNavigation()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    navigate({ type: 'search', query: trimmed })
  }

  const activeVersion =
    currentPage.type === 'search'
      ? currentPage.query.trim().toLowerCase().includes('gay')
        ? 'gay'
        : currentPage.query.trim().toLowerCase().includes('straight')
          ? 'straight'
          : null
      : null

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#0a0b0d]/95 px-3 py-3 backdrop-blur md:px-5">
      <div className="mx-auto flex max-w-7xl items-center gap-3 md:gap-5">
        <button
          onClick={() => navigate({ type: 'home' })}
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
        >
          <span className="flex items-center gap-2">
            <Play className="h-5 w-5 fill-red-500 text-red-500" />
            <span className="text-lg font-bold md:text-xl">
              <span className="text-red-500">xnaik</span> Tube
            </span>
          </span>
        </button>

        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, tags, categories..."
            className="w-full rounded-xl border border-white/15 bg-[#12151b] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none md:text-base"
          />
        </form>

        <div className="hidden items-center rounded-xl border border-white/12 bg-[#12151b] p-1 sm:flex">
          <button
            onClick={() => navigate({ type: 'search', query: 'straight' })}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeVersion === 'straight'
                ? 'bg-red-600 text-white'
                : 'text-zinc-300 hover:bg-white/10'
            }`}
            title="Version - Straight"
          >
            Straight
          </button>
          <button
            onClick={() => navigate({ type: 'search', query: 'gay' })}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeVersion === 'gay'
                ? 'bg-red-600 text-white'
                : 'text-zinc-300 hover:bg-white/10'
            }`}
            title="Version - Gay"
          >
            Gay
          </button>
        </div>

        <div className="flex items-center gap-1 text-zinc-200 md:gap-2">
          <button
            onClick={() => navigate({ type: 'notifications' })}
            title="Notifications"
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate({ type: 'settings' })}
            title="Profile"
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            <CircleUserRound className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="mx-auto mt-2 flex max-w-7xl items-center gap-2 sm:hidden">
        <button
          onClick={() => navigate({ type: 'search', query: 'straight' })}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
            activeVersion === 'straight'
              ? 'bg-red-600 text-white'
              : 'border border-white/15 bg-[#12151b] text-zinc-300'
          }`}
        >
          Straight
        </button>
        <button
          onClick={() => navigate({ type: 'search', query: 'gay' })}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
            activeVersion === 'gay'
              ? 'bg-red-600 text-white'
              : 'border border-white/15 bg-[#12151b] text-zinc-300'
          }`}
        >
          Gay
        </button>
      </div>
    </header>
  )
}
