'use client'

import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@/store/navigation'
import type { Video } from '@/types'
import { formatDuration, formatViews } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

interface RelatedVideosProps {
  currentVideoId: string
}

export function RelatedVideos({ currentVideoId }: RelatedVideosProps) {
  const { navigate } = useNavigation()
  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: ['related-videos', currentVideoId],
    queryFn: () => fetch(`/api/videos/related/${currentVideoId}?limit=8`).then((r) => r.json()),
    enabled: !!currentVideoId,
    staleTime: 1000 * 60 * 2,
  })

  const videos = data?.videos ?? []

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-950">Similar videos</h2>
        <p className="text-xs text-slate-600">Matched by category and tags</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
              <Skeleton className="h-36 w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <p className="text-sm text-slate-600">No similar videos found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => navigate({ type: 'watch', videoId: video.id })}
              className="overflow-hidden rounded border border-slate-200 bg-white text-left shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-video">
                <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs text-white">
                  {formatDuration(video.duration)}
                </span>
              </div>
              <div className="space-y-1 p-3">
                <h3 className="line-clamp-2 text-sm font-medium text-slate-950">{video.title}</h3>
                <p className="text-xs text-slate-600">{formatViews(video.views)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
