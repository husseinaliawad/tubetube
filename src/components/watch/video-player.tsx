'use client'

import { useMemo, useState } from 'react'
import { formatViews, formatDate } from '@/lib/format'
import { useNavigation } from '@/store/navigation'
import { type Video } from '@/types'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Flag,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'

interface VideoPlayerProps {
  video: Video
}

function resolveEmbedUrl(rawUrl: string) {
  if (!rawUrl) return null

  const embedMatch = rawUrl.match(/^https?:\/\/(?:www\.)?fuxxx\.com\/embed\/(\d+)/i)
  if (embedMatch) {
    return `https://fuxxx.com/embed/${embedMatch[1]}`
  }

  const pageMatch = rawUrl.match(/^https?:\/\/(?:www\.)?fuxxx\.com\/videos\/(\d+)\//i)
  if (pageMatch) {
    return `https://fuxxx.com/embed/${pageMatch[1]}`
  }

  return null
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const { navigate } = useNavigation()
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [playbackError, setPlaybackError] = useState(false)
  const [likeCount, setLikeCount] = useState(video.likes)
  const [dislikeCount, setDislikeCount] = useState(video.dislikes)

  const embedUrl = useMemo(() => resolveEmbedUrl(video.videoUrl), [video.videoUrl])

  const playbackUrl = useMemo(() => {
    if (!video.videoUrl || embedUrl) return ''
    if (/^https?:\/\//i.test(video.videoUrl)) {
      return `/api/proxy/video?url=${encodeURIComponent(video.videoUrl)}`
    }
    return video.videoUrl
  }, [video.videoUrl, embedUrl])

  const handleLike = () => {
    if (liked) {
      setLikeCount((c) => c - 1)
      setLiked(false)
    } else {
      setLikeCount((c) => c + 1)
      setLiked(true)
      if (disliked) {
        setDislikeCount((c) => c - 1)
        setDisliked(false)
      }
    }
  }

  const handleDislike = () => {
    if (disliked) {
      setDislikeCount((c) => c - 1)
      setDisliked(false)
    } else {
      setDislikeCount((c) => c + 1)
      setDisliked(true)
      if (liked) {
        setLikeCount((c) => c - 1)
        setLiked(false)
      }
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleSave = () => {
    setSaved(!saved)
    toast.success(saved ? 'Removed from favorites' : 'Saved to Favorites')
  }

  const handleSubscribe = () => {
    setSubscribed((prev) => !prev)
    toast.success(subscribed ? 'Unfollowed' : `Following ${video.uploader.handle}`)
  }

  const handleReport = () => {
    toast.success('Report submitted')
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
        {embedUrl ? (
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <>
            <video
              key={playbackUrl}
              className="w-full h-full"
              controls
              playsInline
              preload="metadata"
              poster={video.thumbnailUrl}
              src={playbackUrl}
              onError={() => setPlaybackError(true)}
              onLoadedData={() => setPlaybackError(false)}
            />
            {playbackError && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
                <div className="text-center text-white space-y-3 max-w-md">
                  <p className="text-sm">
                    This source blocked in-browser playback (host protection, expired token, or invalid stream).
                  </p>
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Source URL
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">
          {video.title}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-3"
              onClick={() => navigate({ type: 'channel', handle: video.uploader.handle })}
            >
              <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
                <img
                  src={video.uploader.avatar || 'https://picsum.photos/seed/default/40/40'}
                  alt={video.uploader.name || ''}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  {video.uploader.name || video.uploader.handle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {video.uploader.subscribers.toLocaleString()} followers
                </p>
              </div>
            </button>
            <Button size="sm" className="rounded-full px-5" onClick={handleSubscribe}>
              {subscribed ? 'Following' : 'Follow'}
            </Button>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <div className="flex items-center bg-secondary rounded-full overflow-hidden">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-l-full rounded-r-none px-3 gap-1.5 ${liked ? 'text-white bg-white/10' : ''}`}
                    onClick={handleLike}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-xs">{likeCount.toLocaleString()}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Like</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="h-6 bg-border" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-r-none rounded-l-none px-3 gap-1.5 ${disliked ? 'text-white bg-white/10' : ''}`}
                    onClick={handleDislike}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-xs">{dislikeCount.toLocaleString()}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dislike</TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="sm" className="rounded-full gap-1.5 px-3" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className={`rounded-full gap-1.5 px-3 ${saved ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={handleSave}
                >
                  <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                  <span className="text-xs">Save</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full gap-1.5 px-3"
                  onClick={handleReport}
                >
                  <Flag className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">Report</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Report</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-secondary text-sm">
          <p className="font-medium text-foreground">
            {formatViews(video.views)} &bull; {formatDate(video.createdAt)}
          </p>
          {video.description && (
            <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{video.description}</p>
          )}
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {video.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="text-xs text-primary hover:text-primary/80 cursor-pointer"
                  onClick={() => navigate({ type: 'search', query: tag.name })}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
