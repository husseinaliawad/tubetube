'use client'

import { useState } from 'react'
import { VideoGrid } from '@/components/home/video-grid'

export function HomePage() {
  const [selectedCategory] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Popular Workout Videos</h2>
      <VideoGrid categorySlug={selectedCategory} />
    </div>
  )
}
