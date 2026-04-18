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
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const search = searchParams.get('q')?.trim() || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { handle: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          handle: true,
          subscribers: true,
          createdAt: true,
          _count: {
            select: {
              videos: true,
              comments: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ])

    const userIds = users.map((u) => u.id)
    const viewsByUploader = await db.video.groupBy({
      by: ['uploaderId'],
      where: { uploaderId: { in: userIds } },
      _sum: { views: true },
    })
    const viewsMap = new Map(viewsByUploader.map((v) => [v.uploaderId, v._sum.views ?? 0]))

    const result = users.map((user) => ({
      ...user,
      totalViews: viewsMap.get(user.id) ?? 0,
    }))

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      users: result,
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
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

