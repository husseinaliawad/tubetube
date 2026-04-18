'use client'

import { useNavigation } from '@/store/navigation'
import { formatViews, formatDate, formatDuration } from '@/lib/format'
import type { Video } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  const { navigate } = useNavigation()

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer group"
      onClick={() => navigate({ type: 'watch', videoId: video.id })}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Info */}
      <div className="flex gap-3 mt-3 px-0.5">
        <Avatar className="h-9 w-9 shrink-0 mt-0.5">
          <AvatarImage src={video.uploader.avatar || undefined} />
          <AvatarFallback className="text-xs">
            {video.uploader.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium leading-5 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <p
            className="text-xs text-muted-foreground mt-1 hover:text-foreground transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              navigate({ type: 'channel', handle: video.uploader.handle })
            }}
          >
            {video.uploader.name || video.uploader.handle}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatViews(video.views)} &bull; {formatDate(video.createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
