import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { buildAllowedVideoUrlWhere } from '@/lib/video-source'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const categorySlug = searchParams.get('category')
    const isShortParam = searchParams.get('isShort')
    const tag = searchParams.get('tag')?.trim()
    const feed = (searchParams.get('feed') || '').trim().toLowerCase()

    const where: Prisma.VideoWhereInput = {
      isPublished: true,
      privacy: 'public',
      ...buildAllowedVideoUrlWhere(),
    }
    const andFilters: Prisma.VideoWhereInput[] = []

    if (categorySlug) {
      andFilters.push({ category: { slug: categorySlug } })
    }

    if (isShortParam === 'true') {
      andFilters.push({ isShort: true })
    } else if (isShortParam === 'false') {
      andFilters.push({ isShort: false })
    }

    if (tag) {
      andFilters.push({ tags: { some: { name: { contains: tag } } } })
    }

    if (feed === 'shorts') {
      andFilters.push({
        OR: [
          { isShort: true },
          {
            AND: [
              { duration: { gt: 30 } },
              { duration: { lte: 120 } },
            ],
          },
        ],
      })
      andFilters.push({
        NOT: {
          tags: {
            some: { name: { contains: 'gif' } },
          },
        },
      })
    } else if (feed === 'gifs') {
      andFilters.push({ isShort: false })
      andFilters.push({
        OR: [
          {
            tags: {
              some: { name: { contains: 'gif' } },
            },
          },
          {
            AND: [
              { duration: { gt: 0 } },
              { duration: { lte: 30 } },
            ],
          },
        ],
      })
    }

    if (andFilters.length > 0) {
      where.AND = andFilters
    }

    const [videos, total] = await Promise.all([
      db.video.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      db.video.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      {
        videos,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      {
        headers: {
          'X-Total-Count': total.toString(),
          'X-Total-Pages': totalPages.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
