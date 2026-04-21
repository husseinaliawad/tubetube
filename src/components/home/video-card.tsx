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
      className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-[#11141b] text-left shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-red-500/35"
      onClick={() => navigate({ type: 'watch', videoId: video.id })}
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute bottom-2 right-2 rounded-md bg-black/90 px-2 py-0.5 text-xs font-semibold text-white">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white">{video.title}</h3>
        <p className="text-xs text-zinc-400">
          {formatViews(video.views)} • {formatDate(video.createdAt)}
        </p>
      </div>
    </button>
  )
}

