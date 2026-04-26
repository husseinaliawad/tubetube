import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { buildAllowedVideoUrlWhere } from '@/lib/video-source'
import { buildSimilarityProfile, scoreRelatedVideo } from '@/lib/video-taxonomy'

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
        title: true,
        description: true,
        uploaderId: true,
        category: {
          select: {
            slug: true,
          },
        },
        tags: { select: { name: true } },
      },
    })

    if (!currentVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const currentProfile = buildSimilarityProfile({
      title: currentVideo.title,
      description: currentVideo.description,
      categorySlug: currentVideo.category?.slug ?? null,
      tags: currentVideo.tags,
    })

    const signalTags = Array.from(currentProfile.tagSet).slice(0, 8)
    const signalTokens = Array.from(currentProfile.tokenSet)
      .filter((token) => token.length >= 3)
      .slice(0, 6)

    const relatedSignalFilters: Prisma.VideoWhereInput[] = []
    if (currentVideo.categoryId) {
      relatedSignalFilters.push({ categoryId: currentVideo.categoryId })
    }
    for (const tag of signalTags) {
      relatedSignalFilters.push({
        tags: {
          some: {
            name: { contains: tag },
          },
        },
      })
    }
    for (const token of signalTokens) {
      relatedSignalFilters.push({
        OR: [
          { title: { contains: token } },
          { description: { contains: token } },
        ],
      })
    }

    const baseWhere: Prisma.VideoWhereInput = {
      id: { not: id },
      isPublished: true,
      privacy: 'public',
      ...buildAllowedVideoUrlWhere(),
    }

    const videos = await db.video.findMany({
      where: {
        ...baseWhere,
        ...(relatedSignalFilters.length > 0 ? { OR: relatedSignalFilters } : {}),
      },
      orderBy: [
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 100,
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

    const fallbackVideos =
      videos.length >= limit
        ? []
        : await db.video.findMany({
            where: {
              ...baseWhere,
              id: {
                notIn: [id, ...videos.map((video) => video.id)],
              },
            },
            orderBy: { createdAt: 'desc' },
            take: Math.max(limit, 24),
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

    const ranked = [...videos, ...fallbackVideos]
      .map((video) => ({
        video,
        score: scoreRelatedVideo({
          current: currentProfile,
          candidate: buildSimilarityProfile({
            title: video.title,
            description: video.description,
            categorySlug: video.category?.slug ?? null,
            tags: video.tags,
          }),
          views: video.views,
          createdAt: video.createdAt,
          sameUploader: video.uploaderId === currentVideo.uploaderId,
        }),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return b.video.createdAt.getTime() - a.video.createdAt.getTime()
      })
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
