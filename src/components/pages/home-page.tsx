'use client'

import { useState } from 'react'
import { VideoGrid } from '@/components/home/video-grid'
import { AdSlot } from '@/components/ads/ad-slot'

export function HomePage() {
  const [selectedCategory] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">Popular Workout Videos</h2>
      <AdSlot title="Top Banner Ad" />
      <VideoGrid categorySlug={selectedCategory} />
      <AdSlot title="In-feed Ad" />
    </div>
  )
}
