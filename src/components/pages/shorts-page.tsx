'use client'

import { useQuery } from '@tanstack/react-query'
import { Zap } from 'lucide-react'
import { useNavigation } from '@/store/navigation'
import type { Video } from '@/types'
import { formatDuration, formatViews } from '@/lib/format'
import { AdSlot } from '@/components/ads/ad-slot'

export function ShortsPage() {
  const { navigate } = useNavigation()
  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: ['shorts-feed'],
    queryFn: () => fetch('/api/videos?limit=24&feed=shorts').then((r) => r.json()),
    staleTime: 1000 * 60 * 2,
  })

  const videos = data?.videos ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
          <Zap className="h-5 w-5 text-sky-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-950">Workout Shorts</h1>
          <p className="text-sm text-slate-600">Only short-form content appears here</p>
        </div>
      </div>
      <AdSlot title="Shorts Sponsor" />

      {isLoading ? (
        <p className="text-slate-600">Loading shorts...</p>
      ) : videos.length === 0 ? (
        <p className="text-slate-600">No short videos found in database.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => navigate({ type: 'watch', videoId: video.id })}
              className="group overflow-hidden rounded border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[9/16]">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs text-white">
                  {formatDuration(video.duration)}
                </span>
              </div>
              <div className="space-y-1 p-2.5">
                <p className="line-clamp-2 text-sm font-medium text-slate-950">{video.title}</p>
                <p className="text-xs text-slate-600">{formatViews(video.views)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
