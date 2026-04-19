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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]">
            <Skeleton className="h-44 w-full rounded-none bg-zinc-800" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-full bg-zinc-800" />
              <Skeleton className="h-3 w-2/3 bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return <p className="text-zinc-400">No videos found.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
