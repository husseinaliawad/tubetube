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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-zinc-950/95 px-2 pb-2 pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.20)] backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.key)
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.page)}
              className={cn(
                'group flex min-w-[68px] flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition',
                active
                  ? 'bg-white/[0.07] text-white shadow-inner shadow-white/[0.04]'
                  : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6 transition',
                  active ? 'text-sky-400' : 'text-zinc-400 group-hover:text-zinc-100'
                )}
              />
              <span className={cn(active ? 'font-medium text-sky-100' : 'text-zinc-400')}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
