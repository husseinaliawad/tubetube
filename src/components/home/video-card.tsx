'use client'

import { useNavigation } from '@/store/navigation'
import { formatViews, formatDate, formatDuration } from '@/lib/format'
import type { Video } from '@/types'

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  const { navigate } = useNavigation()

  return (
    <button
      className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] text-left transition-transform hover:-translate-y-1"
      onClick={() => navigate({ type: 'watch', videoId: video.id })}
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
        <span className="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-0.5 text-xs font-semibold text-white">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-5 text-white">{video.title}</h3>
        <p className="text-xs text-zinc-400">
          {video.uploader.name || video.uploader.handle} • {formatViews(video.views)} • {formatDate(video.createdAt)}
        </p>
      </div>
    </button>
  )
}
