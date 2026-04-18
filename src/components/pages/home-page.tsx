'use client'

import { useState } from 'react'
import { CategoryFilter } from '@/components/home/category-filter'
import { VideoGrid } from '@/components/home/video-grid'

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <VideoGrid categorySlug={selectedCategory} />
    </div>
  )
}
