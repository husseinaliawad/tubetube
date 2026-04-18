import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params

    const user = await db.user.findUnique({
      where: { handle },
      include: {
        videos: {
          where: {
            isPublished: true,
            privacy: 'public',
          },
          orderBy: { createdAt: 'desc' },
          include: {
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
        },
        playlists: {
          where: { isPublic: true },
          include: {
            items: {
              include: {
                video: {
                  select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    duration: true,
                    views: true,
                  },
                },
              },
              orderBy: { position: 'asc' },
            },
            _count: {
              select: { items: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            videos: true,
            playlists: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ channel: user })
  } catch (error) {
    console.error('Error fetching channel:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channel' },
      { status: 500 }
    )
  }
}
