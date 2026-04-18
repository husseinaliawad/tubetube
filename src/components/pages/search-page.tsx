'use client'

import { useQuery } from '@tanstack/react-query'
import { VideoCard } from '@/components/home/video-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'
import type { Video } from '@/types'

interface SearchPageProps {
  query: string
}

export function SearchPage({ query }: SearchPageProps) {
  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: ['search', query],
    queryFn: () => fetch(`/api/search?q=${encodeURIComponent(query)}`).then((r) => r.json()),
    enabled: !!query,
  })

  const videos = data?.videos ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">
          Scene results for &quot;{query}&quot;
        </h1>
        <span className="text-sm text-muted-foreground">
          ({videos.length} {videos.length === 1 ? 'result' : 'results'})
        </span>
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
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No results found</p>
          <p className="text-muted-foreground mt-1">
            Try different tags or check your spelling
          </p>
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
