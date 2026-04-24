'use client'

import { useNavigation } from '@/store/navigation'
import { formatDate, formatDuration, formatViews } from '@/lib/format'
import type { Video } from '@/types'

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  const { navigate } = useNavigation()
  const previewFrames = Array.from({ length: 4 })
  const uploaderName = video.uploader?.name || video.uploader?.handle || 'xnaik Tube'

  return (
    <button
      className="group w-full overflow-hidden rounded bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
      onClick={() => navigate({ type: 'watch', videoId: video.id })}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <span className="absolute bottom-2 right-2 rounded bg-black/90 px-2 py-0.5 text-xs font-semibold text-white">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 min-h-10 text-[15.5px] font-medium leading-[1.35] text-slate-950">
          {video.title}
        </h3>
        <p className="text-xs text-slate-600">
          {uploaderName} &middot; {formatViews(video.views)} &middot; {formatDate(video.createdAt)}
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {previewFrames.map((_, index) => (
          <img
            key={index}
            src={video.thumbnailUrl}
            alt={`${video.title} preview ${index + 1}`}
            className="h-[46px] w-[68px] shrink-0 rounded border border-slate-200 object-cover"
            style={{ objectPosition: `${index * 33}% 50%` }}
          />
        ))}
      </div>
    </button>
  )
}
