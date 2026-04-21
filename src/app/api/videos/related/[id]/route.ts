import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { buildAllowedVideoUrlWhere } from '@/lib/video-source'

function scoreVideo(
  video: {
    categoryId: string | null
    tags: Array<{ name: string }>
    views: number
    createdAt: Date
  },
  currentCategoryId: string | null,
  currentTagNames: Set<string>
) {
  let score = 0

  if (currentCategoryId && video.categoryId === currentCategoryId) {
    score += 6
  }

  let sharedTags = 0
  for (const tag of video.tags) {
    if (currentTagNames.has(tag.name.toLowerCase())) {
      sharedTags += 1
    }
  }
  score += Math.min(4, sharedTags) * 3

  const popularity = Math.min(3, Math.floor(video.views / 5000))
  score += popularity

  const ageHours = Math.max(1, (Date.now() - video.createdAt.getTime()) / (1000 * 60 * 60))
  score += Math.max(0, 2 - ageHours / (24 * 7))

  return score
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const limit = Math.min(24, Math.max(1, Number(new URL(request.url).searchParams.get('limit') || 12)))

    const currentVideo = await db.video.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        tags: { select: { name: true } },
      },
    })

    if (!currentVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const tagNames = currentVideo.tags
      .map((tag) => tag.name.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8)
    const tagSet = new Set(tagNames)

    const relatedSignalFilters: Prisma.VideoWhereInput[] = []
    if (currentVideo.categoryId) {
      relatedSignalFilters.push({ categoryId: currentVideo.categoryId })
    }
    for (const tag of tagNames) {
      relatedSignalFilters.push({
        tags: {
          some: {
            name: { contains: tag },
          },
        },
      })
    }

    const videos = await db.video.findMany({
      where: {
        id: { not: id },
        isPublished: true,
        privacy: 'public',
        ...buildAllowedVideoUrlWhere(),
        ...(relatedSignalFilters.length > 0 ? { OR: relatedSignalFilters } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 80,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            subscribers: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
      },
    })

    const ranked = videos
      .map((video) => ({
        video,
        score: scoreVideo(video, currentVideo.categoryId, tagSet),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => entry.video)

    return NextResponse.json({ videos: ranked })
  } catch (error) {
    console.error('Error fetching related videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch related videos' },
      { status: 500 }
    )
  }
}
