'use client'

import { useQuery } from '@tanstack/react-query'
import { VideoCard } from '@/components/home/video-card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'
import type { Video } from '@/types'

export function TrendingPage() {
  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: ['trending'],
    queryFn: () => fetch('/api/trending').then((r) => r.json()),
    staleTime: 1000 * 60 * 5,
  })

  const videos = data?.videos ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Trending</h1>
          <p className="text-sm text-muted-foreground">
            See what&apos;s hot on VelvetTube right now
          </p>
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {videos.map((video, index) => (
            <div key={video.id} className="relative">
              {index < 3 && (
                <div className="absolute top-2 left-2 z-10 h-7 w-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  {index + 1}
                </div>
              )}
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
