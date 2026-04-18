'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { VideoCard } from '@/components/home/video-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'
import type { Video } from '@/types'

const subscribedHandles = ['velvetvixen', 'midnightmia', 'couplesnest']

export function SubscriptionsPage() {
  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: ['subscriptions-feed'],
    queryFn: () => fetch('/api/videos?limit=48').then((r) => r.json()),
    staleTime: 1000 * 60 * 2,
  })

  const videos = useMemo(
    () => (data?.videos ?? []).filter((video) => subscribedHandles.includes(video.uploader.handle)),
    [data]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Following</h1>
          <p className="text-sm text-muted-foreground">Latest scenes from creators you follow</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-video rounded-xl" />
              <div className="flex gap-3 mt-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-foreground">No scenes in your following feed yet</p>
          <p className="text-muted-foreground mt-1">Follow more creators to build your feed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
