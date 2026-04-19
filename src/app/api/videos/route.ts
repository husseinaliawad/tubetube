import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const categorySlug = searchParams.get('category')
    const isShortParam = searchParams.get('isShort')
    const tag = searchParams.get('tag')?.trim()

    const where: Record<string, unknown> = {
      isPublished: true,
      privacy: 'public',
    }

    if (categorySlug) {
      where.category = { slug: categorySlug }
    }

    if (isShortParam === 'true') {
      where.isShort = true
    } else if (isShortParam === 'false') {
      where.isShort = false
    }

    if (tag) {
      where.tags = { some: { name: { contains: tag } } }
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
