'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { VideoCard } from './video-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Video } from '@/types'
import { Button } from '@/components/ui/button'

interface VideoGridProps {
  categorySlug?: string | null
  queryKey?: string[]
}

export function VideoGrid({ categorySlug = null, queryKey }: VideoGridProps) {
  const key = queryKey ?? ['videos', categorySlug]

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery<{
    videos: Video[]
    pagination: {
      page: number
      hasNextPage: boolean
    }
  }>({
    queryKey: key,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams()
      params.set('limit', '24')
      params.set('page', String(pageParam))
      if (categorySlug) params.set('category', categorySlug)
      return fetch(`/api/videos?${params}`).then((r) => r.json())
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    staleTime: 1000 * 60 * 2,
  })

  const videos = data?.pages.flatMap((page) => page.videos) ?? []

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded bg-white shadow-sm">
            <Skeleton className="h-44 w-full rounded-none bg-slate-200" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-full bg-slate-200" />
              <Skeleton className="h-3 w-2/3 bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return <p className="rounded bg-white px-4 py-3 text-slate-600 shadow-sm">No videos found.</p>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
