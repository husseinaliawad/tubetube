'use client'

import { useState } from 'react'
import { VideoGrid } from '@/components/home/video-grid'
import { AdSlot } from '@/components/ads/ad-slot'

export function HomePage() {
  const [selectedCategory] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950 md:text-3xl">Popular Videos</h2>
          <p className="mt-1 text-sm text-slate-600">Fresh videos loaded from your backend.</p>
        </div>
      </section>
      <AdSlot title="Top Banner Ad" />
      <VideoGrid categorySlug={selectedCategory} />
      <AdSlot title="In-feed Ad" />
    </div>
  )
}
