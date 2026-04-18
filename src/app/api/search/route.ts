import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const videos = await db.video.findMany({
      where: {
        isPublished: true,
        privacy: 'public',
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { tags: { some: { name: { contains: query } } } },
        ],
      },
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
      orderBy: { views: 'desc' },
      take: 30,
    })

    return NextResponse.json({ videos, query })
  } catch (error) {
    console.error('Error searching videos:', error)
    return NextResponse.json(
      { error: 'Failed to search videos' },
      { status: 500 }
    )
  }
}
