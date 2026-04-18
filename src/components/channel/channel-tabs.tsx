'use client'

import type { ChannelData } from '@/types'
import { VideoCard } from '@/components/home/video-card'
import { formatDate } from '@/lib/format'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface ChannelTabsProps {
  channel: ChannelData
}

export function ChannelTabs({ channel }: ChannelTabsProps) {
  return (
    <div className="space-y-4 mt-6">
      <div className="border-b border-border">
        <div className="flex gap-6">
          <TabButton active>Scenes</TabButton>
          <TabButton>Shorts</TabButton>
          <TabButton active={false}>Playlists</TabButton>
          <TabButton active={false}>About</TabButton>
        </div>
      </div>

      {/* Videos Tab */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {channel.videos.length > 0 ? (
          channel.videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No scenes yet</p>
          </div>
        )}
      </div>

      {/* Playlists Section */}
      {channel.playlists.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Playlists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {channel.playlists.map((playlist) => (
              <Card key={playlist.id} className="overflow-hidden cursor-pointer hover:bg-secondary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-secondary">
                    <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                      {playlist.items.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.video.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-black/80 rounded-lg px-2.5 py-1.5 text-white text-sm font-medium">
                        {playlist._count?.items || playlist.items.length} scenes
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-foreground">{playlist.title}</h3>
                    {playlist.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(playlist.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TabButton({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
