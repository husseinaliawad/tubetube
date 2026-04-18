'use client'

import { useQuery } from '@tanstack/react-query'
import { VideoCard } from './video-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Video } from '@/types'

interface VideoGridProps {
  categorySlug?: string | null
  queryKey?: string[]
}

export function VideoGrid({ categorySlug = null, queryKey }: VideoGridProps) {
  const key = queryKey ?? ['videos', categorySlug]

  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: key,
    queryFn: () => {
      const params = new URLSearchParams()
      params.set('limit', '24')
      if (categorySlug) params.set('category', categorySlug)
      return fetch(`/api/videos?${params}`).then((r) => r.json())
    },
    staleTime: 1000 * 60 * 2,
  })

  const videos = data?.videos ?? []

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-video rounded-xl" />
            <div className="flex gap-3 mt-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-lg">No scenes found</p>
        <p className="text-muted-foreground text-sm mt-1">Try selecting a different category</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
