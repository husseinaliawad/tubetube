'use client'

import { useQuery } from '@tanstack/react-query'
import { Film } from 'lucide-react'
import type { Video } from '@/types'
import { useNavigation } from '@/store/navigation'
import { formatViews, formatDate, formatDuration } from '@/lib/format'
import { AdSlot } from '@/components/ads/ad-slot'

export function GifsPage() {
  const { navigate } = useNavigation()
  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: ['gifs-feed'],
    queryFn: () => fetch('/api/videos?limit=24&feed=gifs').then((r) => r.json()),
    staleTime: 1000 * 60 * 2,
  })

  const videos = data?.videos ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/20">
          <Film className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Workout GIFs</h1>
          <p className="text-sm text-zinc-400">Only GIF-style clips appear here</p>
        </div>
      </div>
      <AdSlot title="GIFs Sponsor" />

      {isLoading ? (
        <p className="text-zinc-400">Loading GIF feed...</p>
      ) : videos.length === 0 ? (
        <p className="text-zinc-400">No GIF-style items available yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => navigate({ type: 'watch', videoId: video.id })}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#11141b] text-left shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-red-500/35"
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs text-white">
                  {formatDuration(video.duration)}
                </span>
              </div>
              <div className="space-y-1 p-3">
                <h3 className="line-clamp-2 text-sm font-medium text-white">{video.title}</h3>
                <p className="text-xs text-zinc-400">
                  {formatViews(video.views)} • {formatDate(video.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
