'use client'

import { useState } from 'react'
import { Bell, CircleUserRound, Play, Search, Video } from 'lucide-react'
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white px-3 py-2.5 shadow-sm md:px-5">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 md:gap-5">
        <button
          onClick={() => navigate({ type: 'home' })}
          className="shrink-0 rounded-lg px-1 py-1 text-left text-slate-950 transition hover:bg-slate-100 md:px-2"
        >
          <span className="flex items-center gap-2">
            <Play className="h-5 w-5 fill-red-500 text-red-500" />
            <span className="text-lg font-bold md:text-xl">
              <span className="text-red-500">xnaik</span> Tube
            </span>
          </span>
        </button>

        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, tags, categories..."
            className="w-full rounded border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 placeholder:text-slate-500 focus:border-sky-600 focus:outline-none md:text-base"
          />
        </form>

        <div className="hidden items-center rounded border border-slate-300 bg-slate-50 p-1 lg:flex">
          <button
            onClick={() => navigate({ type: 'search', query: 'straight' })}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
              activeVersion === 'straight'
                ? 'bg-red-600 text-white'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
            title="Version - Straight"
          >
            Straight
          </button>
          <button
            onClick={() => navigate({ type: 'search', query: 'gay' })}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
              activeVersion === 'gay'
                ? 'bg-red-600 text-white'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
            title="Version - Gay"
          >
            Gay
          </button>
        </div>

        <div className="flex items-center gap-1 text-slate-700 md:gap-2">
          <button
            onClick={() => navigate({ type: 'upload' })}
            title="Upload"
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate({ type: 'notifications' })}
            title="Notifications"
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate({ type: 'settings' })}
            title="Profile"
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <CircleUserRound className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
