'use client'

import { VideoGrid } from '@/components/home/video-grid'
import { Badge } from '@/components/ui/badge'
import { Film } from 'lucide-react'

interface CategoryPageProps {
  slug: string
  name: string
}

export function CategoryPage({ slug, name }: CategoryPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
          <Film className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{name}</h1>
          <p className="text-sm text-muted-foreground">Scenes in this category</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {slug}
        </Badge>
      </div>

      <VideoGrid categorySlug={slug} queryKey={['category', slug]} />
    </div>
  )
}
