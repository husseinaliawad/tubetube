'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useNavigation } from '@/store/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { HomePage } from '@/components/pages/home-page'
import { DashboardPage } from '@/components/pages/dashboard-page'
import { WatchPage } from '@/components/pages/watch-page'
import { UploadPage } from '@/components/pages/upload-page'
import { ChannelPage } from '@/components/pages/channel-page'
import { SearchPage } from '@/components/pages/search-page'
import { TrendingPage } from '@/components/pages/trending-page'
import { SubscriptionsPage } from '@/components/pages/subscriptions-page'
import { LibraryPage } from '@/components/pages/library-page'
import { CategoryPage } from '@/components/pages/category-page'
import { NotificationsPage } from '@/components/pages/notifications-page'
import { SettingsPage } from '@/components/pages/settings-page'
import { GifsPage } from '@/components/pages/gifs-page'
import { ShortsPage } from '@/components/pages/shorts-page'
import { MessagesPage } from '@/components/pages/messages-page'

export default function Home() {
  const { currentPage } = useNavigation()

  const renderPage = () => {
    switch (currentPage.type) {
      case 'home':
        return <HomePage />
      case 'dashboard':
        return <DashboardPage />
      case 'watch':
        return <WatchPage videoId={currentPage.videoId} />
      case 'upload':
        return <UploadPage />
      case 'channel':
        return <ChannelPage handle={currentPage.handle} />
      case 'search':
        return <SearchPage query={currentPage.query} />
      case 'trending':
        return <TrendingPage />
      case 'subscriptions':
        return <SubscriptionsPage />
      case 'library':
        return <LibraryPage />
      case 'category':
        return <CategoryPage slug={currentPage.slug} name={currentPage.name} />
      case 'notifications':
        return <NotificationsPage />
      case 'settings':
        return <SettingsPage />
      case 'gifs':
        return <GifsPage />
      case 'shorts':
        return <ShortsPage />
      case 'messages':
        return <MessagesPage />
      default:
        return <HomePage />
    }
  }

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={JSON.stringify(currentPage)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  )
}
