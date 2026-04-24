'use client'

import { useMemo, useState } from 'react'
import { formatViews, formatDate } from '@/lib/format'
import { useNavigation } from '@/store/navigation'
import { isAllowedVideoSource } from '@/lib/video-source'
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
} from 'lucide-react'
import { toast } from 'sonner'

interface VideoPlayerProps {
  video: Video
}

function resolveEmbedUrl(rawUrl: string) {
  if (!rawUrl) return null

  const xhamsterEmbedMatch = rawUrl.match(/^https?:\/\/(?:www\.)?xhamster2?\.com\/embed\/([a-zA-Z0-9]+)/i)
  if (xhamsterEmbedMatch) {
    return `https://xhamster2.com/embed/${xhamsterEmbedMatch[1]}`
  }

  const xhamsterPageMatch = rawUrl.match(/^https?:\/\/(?:www\.)?xhamster2?\.com\/videos\/.*-(xh[a-zA-Z0-9]+)/i)
  if (xhamsterPageMatch) {
    return `https://xhamster2.com/embed/${xhamsterPageMatch[1]}`
  }

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
  const [playbackError, setPlaybackError] = useState(false)
  const [likeCount, setLikeCount] = useState(video.likes)
  const [dislikeCount, setDislikeCount] = useState(video.dislikes)

  const allowedSource = useMemo(() => isAllowedVideoSource(video.videoUrl), [video.videoUrl])
  const embedUrl = useMemo(() => resolveEmbedUrl(video.videoUrl), [video.videoUrl])

  const playbackUrl = useMemo(() => {
    if (!allowedSource) return ''
    if (!video.videoUrl || embedUrl) return ''
    if (/^https?:\/\//i.test(video.videoUrl)) {
      return `/api/proxy/video?url=${encodeURIComponent(video.videoUrl)}`
    }
    return video.videoUrl
  }, [video.videoUrl, embedUrl, allowedSource])

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

  const handleReport = () => {
    toast.success('Report submitted')
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
        {!allowedSource ? (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
            <div className="text-center text-white space-y-3 max-w-md">
              <p className="text-sm">
                This video source is blocked by the site whitelist policy.
              </p>
              <p className="text-xs text-zinc-300">
                Only videos hosted on your allowed domains can be played.
              </p>
            </div>
          </div>
        ) : embedUrl ? (
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
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
                  <p className="text-xs text-zinc-300">
                    Playback is restricted by the upstream host. This app will keep you on this page.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <h1 className="text-lg md:text-xl font-bold text-slate-950 leading-tight">
          {video.title}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-1 flex-wrap">
            <div className="flex items-center overflow-hidden rounded-full bg-slate-100 text-slate-900">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-l-full rounded-r-none px-3 gap-1.5 hover:bg-slate-200 ${liked ? 'bg-sky-600 text-white hover:bg-sky-700' : ''}`}
                    onClick={handleLike}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-xs">{likeCount.toLocaleString()}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Like</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="h-6 bg-slate-300" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-r-none rounded-l-none px-3 gap-1.5 hover:bg-slate-200 ${disliked ? 'bg-slate-700 text-white hover:bg-slate-800' : ''}`}
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
                <Button variant="secondary" size="sm" className="rounded-full gap-1.5 bg-slate-100 px-3 text-slate-950 hover:bg-slate-200" onClick={handleShare}>
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
                  className={`rounded-full gap-1.5 px-3 ${saved ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-slate-100 text-slate-950 hover:bg-slate-200'}`}
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
                  className="rounded-full gap-1.5 px-3 text-slate-950 hover:bg-slate-100"
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

        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-950 shadow-sm">
          <p className="font-medium text-slate-950">
            {formatViews(video.views)} &bull; {formatDate(video.createdAt)}
          </p>
          {video.description && (
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{video.description}</p>
          )}
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {video.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="cursor-pointer text-xs text-sky-700 hover:text-sky-900"
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
