import { create } from 'zustand'

export type Page =
  | { type: 'home' }
  | { type: 'dashboard' }
  | { type: 'watch'; videoId: string }
  | { type: 'upload' }
  | { type: 'channel'; handle: string }
  | { type: 'search'; query: string }
  | { type: 'trending' }
  | { type: 'subscriptions' }
  | { type: 'library' }
  | { type: 'category'; slug: string; name: string }
  | { type: 'notifications' }
  | { type: 'settings' }
  | { type: 'gifs' }
  | { type: 'shorts' }
  | { type: 'messages' }

interface NavigationState {
  currentPage: Page
  navigate: (page: Page) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useNavigation = create<NavigationState>((set) => ({
  currentPage: { type: 'home' },
  navigate: (page) => set({ currentPage: page }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
