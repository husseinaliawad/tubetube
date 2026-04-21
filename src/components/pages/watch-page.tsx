'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { VideoPlayer } from '@/components/watch/video-player'
import { CommentSection } from '@/components/watch/comment-section'
import { RecommendedSidebar } from '@/components/watch/recommended-sidebar'
import { VideoStoryboard } from '@/components/watch/video-storyboard'
import { RelatedVideos } from '@/components/watch/related-videos'
import { Skeleton } from '@/components/ui/skeleton'
import type { Video } from '@/types'

interface WatchPageProps {
  videoId: string
}

export function WatchPage({ videoId }: WatchPageProps) {
  const { data, isLoading } = useQuery<{ video: Video }>({
    queryKey: ['video', videoId],
    queryFn: () => fetch(`/api/videos/${videoId}`).then((r) => r.json()),
    enabled: !!videoId,
  })

  // Increment view count on mount
  useEffect(() => {
    if (videoId) {
      fetch(`/api/videos/${videoId}`, { method: 'POST' }).catch(() => {})
    }
  }, [videoId])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="w-full lg:w-80 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="w-40 h-[90px] rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data?.video) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-semibold text-foreground">Scene not found</p>
        <p className="text-muted-foreground mt-2">
          The scene you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
      </div>
    )
  }

  const video = data.video

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          <VideoPlayer video={video} />
          <VideoStoryboard thumbnailUrl={video.thumbnailUrl} duration={video.duration} />
          <RelatedVideos currentVideoId={videoId} />
          <CommentSection videoId={videoId} />
        </div>

        {/* Recommended Sidebar */}
        <div className="w-full lg:w-80 shrink-0 hidden lg:block">
          <RecommendedSidebar currentVideoId={videoId} />
        </div>
      </div>
    </div>
  )
}
