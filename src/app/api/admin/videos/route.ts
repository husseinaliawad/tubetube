import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

type StatusFilter = 'all' | 'published' | 'draft' | 'public' | 'private' | 'unlisted'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const search = searchParams.get('q')?.trim() || ''
    const status = (searchParams.get('status') || 'all') as StatusFilter

    const where: Record<string, unknown> = {}

    if (status === 'published') where.isPublished = true
    if (status === 'draft') where.isPublished = false
    if (status === 'public') where.privacy = 'public'
    if (status === 'private') where.privacy = 'private'
    if (status === 'unlisted') where.privacy = 'unlisted'

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { uploader: { handle: { contains: search } } },
        { uploader: { name: { contains: search } } },
      ]
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
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      db.video.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching admin videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      title,
      description,
      thumbnailUrl,
      videoUrl,
      duration,
      uploaderId,
      categoryId,
      privacy,
      isPublished,
      tags,
    } = body as {
      title?: string
      description?: string
      thumbnailUrl?: string
      videoUrl?: string
      duration?: number
      uploaderId?: string
      categoryId?: string | null
      privacy?: string
      isPublished?: boolean
      tags?: string[]
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!thumbnailUrl?.trim()) {
      return NextResponse.json({ error: 'Thumbnail URL is required' }, { status: 400 })
    }
    if (!videoUrl?.trim()) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }
    if (!uploaderId) {
      return NextResponse.json({ error: 'Uploader is required' }, { status: 400 })
    }

    const uploader = await db.user.findUnique({ where: { id: uploaderId } })
    if (!uploader) {
      return NextResponse.json({ error: 'Uploader not found' }, { status: 404 })
    }

    if (categoryId) {
      const category = await db.category.findUnique({ where: { id: categoryId } })
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
    }

    const cleanTags = Array.isArray(tags)
      ? tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 20)
      : []

    const created = await db.video.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        thumbnailUrl: thumbnailUrl.trim(),
        videoUrl: videoUrl.trim(),
        duration: typeof duration === 'number' && duration >= 0 ? Math.floor(duration) : 0,
        uploaderId,
        categoryId: categoryId || null,
        privacy:
          privacy === 'private' || privacy === 'unlisted' || privacy === 'public'
            ? privacy
            : 'public',
        isPublished: Boolean(isPublished),
        tags: {
          create: cleanTags.map((name) => ({ name })),
        },
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            handle: true,
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

    return NextResponse.json({ video: created }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
