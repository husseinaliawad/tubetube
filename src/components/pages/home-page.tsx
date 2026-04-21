'use client'

import { useState } from 'react'
import { VideoGrid } from '@/components/home/video-grid'
import { AdSlot } from '@/components/ads/ad-slot'

export function HomePage() {
  const [selectedCategory] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#151821] via-[#12161f] to-[#0f131b] p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Discover</p>
        <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">Popular Videos</h2>
        <p className="mt-1 text-sm text-zinc-400">Trending scenes updated from your latest imports.</p>
      </section>
      <AdSlot title="Top Banner Ad" />
      <VideoGrid categorySlug={selectedCategory} />
      <AdSlot title="In-feed Ad" />
    </div>
  )
}
