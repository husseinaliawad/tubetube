'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatSubscribers } from '@/lib/format'
import type { ChannelData } from '@/types'

interface ChannelHeaderProps {
  channel: ChannelData
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  const [subscribed, setSubscribed] = useState(false)
  const [subCount, setSubCount] = useState(channel.subscribers)

  const handleSubscribe = () => {
    if (subscribed) {
      setSubCount((c) => c - 1)
    } else {
      setSubCount((c) => c + 1)
    }
    setSubscribed(!subscribed)
  }

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-28 md:h-40 rounded-xl overflow-hidden bg-secondary">
        {channel.banner && (
          <img
            src={channel.banner}
            alt={`${channel.name} banner`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Avatar + Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-[-3rem] sm:mt-[-2.5rem] px-4 sm:px-0">
        {/* Avatar */}
        <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-background bg-secondary overflow-hidden shrink-0">
          <img
            src={channel.avatar || 'https://picsum.photos/seed/default/100/100'}
            alt={channel.name || ''}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name + Handle + Stats + Subscribe */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              {channel.name || channel.handle}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
              <span>@{channel.handle}</span>
              <span>&bull;</span>
              <span>{formatSubscribers(subCount)} followers</span>
              <span>&bull;</span>
              <span>{channel._count.videos} scenes</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={subscribed ? 'secondary' : 'default'}
              className={`rounded-full px-6 ${subscribed ? '' : ''}`}
              onClick={handleSubscribe}
            >
              {subscribed ? 'Following' : 'Follow'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bio */}
      {channel.bio && (
        <p className="text-sm text-muted-foreground mt-4 px-0.5">{channel.bio}</p>
      )}
    </div>
  )
}
