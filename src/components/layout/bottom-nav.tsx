'use client'

import { Home, Film, Zap, MessageSquare } from 'lucide-react'
import { useNavigation } from '@/store/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { key: 'tube', label: 'Tube', icon: Home, page: { type: 'home' } as const },
  { key: 'gifs', label: 'GIFs', icon: Film, page: { type: 'gifs' } as const },
  { key: 'shorts', label: 'Shorts', icon: Zap, page: { type: 'shorts' } as const },
  { key: 'messages', label: 'Messages', icon: MessageSquare, page: { type: 'messages' } as const },
]

export function BottomNav() {
  const { currentPage, navigate } = useNavigation()

  const isActive = (key: string) => {
    if (key === 'tube') return currentPage.type === 'home'
    if (key === 'gifs') return currentPage.type === 'gifs'
    if (key === 'shorts') return currentPage.type === 'shorts'
    if (key === 'messages') return currentPage.type === 'messages'
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-2 pb-1.5 pt-2.5 shadow-[0_-2px_8px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-4xl items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.page)}
              className={cn(
                'flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs transition',
                isActive(item.key)
                  ? 'text-sky-700'
                  : 'text-slate-500 hover:text-slate-950'
              )}
            >
              <Icon className="h-6 w-6" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
