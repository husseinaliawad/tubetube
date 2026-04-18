'use client'

import { useQuery } from '@tanstack/react-query'
import { ChannelHeader } from '@/components/channel/channel-header'
import { ChannelTabs } from '@/components/channel/channel-tabs'
import { Skeleton } from '@/components/ui/skeleton'
import type { ChannelData } from '@/types'

interface ChannelPageProps {
  handle: string
}

export function ChannelPage({ handle }: ChannelPageProps) {
  const { data, isLoading } = useQuery<{ channel: ChannelData }>({
    queryKey: ['channel', handle],
    queryFn: () => fetch(`/api/channels/${handle}`).then((r) => r.json()),
    enabled: !!handle,
  })

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <div className="flex items-end gap-4 -mt-12">
          <Skeleton className="h-20 w-20 rounded-full border-4 border-background" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-4 w-96 mt-4" />
        <div className="border-b border-border pt-6">
          <div className="flex gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-4 w-3/4 mt-3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data?.channel) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-semibold text-foreground">Creator not found</p>
        <p className="text-muted-foreground mt-2">
          The creator profile you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    )
  }

  const channel = data.channel

  return (
    <div className="max-w-6xl mx-auto">
      <ChannelHeader channel={channel} />
      <ChannelTabs channel={channel} />
    </div>
  )
}
