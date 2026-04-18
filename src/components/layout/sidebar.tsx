'use client'

import { useNavigation, type Page } from '@/store/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Home,
  LayoutDashboard,
  TrendingUp,
  Users,
  Library,
  Music,
  Gamepad2,
  Newspaper,
  Trophy,
  GraduationCap,
  ChefHat,
  Film,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface NavItem {
  label: string
  icon: React.ElementType
  page: Page
  category?: string
}

const mainNavItems: NavItem[] = [
  { label: 'Home', icon: Home, page: { type: 'home' } },
  { label: 'Dashboard', icon: LayoutDashboard, page: { type: 'dashboard' } },
  { label: 'Trending', icon: TrendingUp, page: { type: 'trending' } },
  { label: 'Following', icon: Users, page: { type: 'subscriptions' } },
  { label: 'Library', icon: Library, page: { type: 'library' } },
]

const categoryItems: NavItem[] = [
  { label: 'Amateur', icon: Newspaper, page: { type: 'category', slug: 'amateur', name: 'Amateur' }, category: 'amateur' },
  { label: 'POV', icon: Music, page: { type: 'category', slug: 'pov', name: 'POV' }, category: 'pov' },
  { label: 'MILF', icon: Gamepad2, page: { type: 'category', slug: 'milf', name: 'MILF' }, category: 'milf' },
  { label: 'Couples', icon: Trophy, page: { type: 'category', slug: 'couples', name: 'Couples' }, category: 'couples' },
  { label: 'BDSM', icon: GraduationCap, page: { type: 'category', slug: 'bdsm', name: 'BDSM' }, category: 'bdsm' },
  { label: 'Lesbian', icon: ChefHat, page: { type: 'category', slug: 'lesbian', name: 'Lesbian' }, category: 'lesbian' },
]

export function Sidebar() {
  const { currentPage, navigate, sidebarOpen, setSidebarOpen } = useNavigation()

  const isActive = (page: Page) => {
    if (currentPage.type === page.type) {
      if ('videoId' in page && 'videoId' in currentPage) {
        return page.videoId === currentPage.videoId
      }
      if ('handle' in page && 'handle' in currentPage) {
        return page.handle === currentPage.handle
      }
      if ('query' in page && 'query' in currentPage) {
        return page.query === currentPage.query
      }
      if ('slug' in page && 'slug' in currentPage) {
        return page.slug === currentPage.slug
      }
      return true
    }
    return false
  }

  const handleNav = (item: NavItem) => {
    navigate(item.page)
    setSidebarOpen(false)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-16 shrink-0">
        <Film className="h-6 w-6 text-red-500" />
        <span className="font-bold text-lg text-foreground">VelvetTube</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.page)
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <Separator className="my-2" />

        <div className="px-3 py-2">
          <p className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Categories
          </p>
          {categoryItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.page)
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 h-screen sticky top-0 shrink-0 border-r border-border">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
            >
              {sidebarContent}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-3 p-1 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
