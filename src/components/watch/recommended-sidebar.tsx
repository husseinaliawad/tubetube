'use client'

import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@/store/navigation'
import { formatViews, formatDuration, formatDate } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Video } from '@/types'

interface RecommendedSidebarProps {
  currentVideoId: string
}

export function RecommendedSidebar({ currentVideoId }: RecommendedSidebarProps) {
  const { navigate } = useNavigation()

  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: ['recommended', currentVideoId],
    queryFn: () => fetch('/api/videos?limit=20').then((r) => r.json()),
    staleTime: 1000 * 60 * 2,
  })

  const videos = (data?.videos ?? []).filter((v) => v.id !== currentVideoId)

  return (
    <ScrollArea className="h-[calc(100vh-5rem)] max-h-none">
      <div className="space-y-3 pr-2">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="w-40 h-[90px] rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5 pt-0.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : (
          videos.map((video) => (
            <button
              key={video.id}
              className="flex gap-2 w-full text-left group"
              onClick={() => navigate({ type: 'watch', videoId: video.id })}
            >
              <div className="relative w-40 shrink-0 aspect-video rounded-lg overflow-hidden bg-secondary">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <h4 className="text-sm font-medium leading-4 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                  {video.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {video.uploader.name || video.uploader.handle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatViews(video.views)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </ScrollArea>
  )
}
