import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)))
    const search = searchParams.get('q')?.trim() || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { content: { contains: search } },
        { user: { handle: { contains: search } } },
        { user: { name: { contains: search } } },
        { video: { title: { contains: search } } },
      ]
    }

    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
            },
          },
          video: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
      db.comment.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      comments,
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
    console.error('Error fetching admin comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

