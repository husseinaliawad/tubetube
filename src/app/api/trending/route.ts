import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildAllowedVideoUrlWhere } from '@/lib/video-source'

export async function GET() {
  try {
    const videos = await db.video.findMany({
      where: {
        isPublished: true,
        privacy: 'public',
        ...buildAllowedVideoUrlWhere(),
      },
      orderBy: { views: 'desc' },
      take: 8,
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

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching trending videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending videos' },
      { status: 500 }
    )
  }
}
