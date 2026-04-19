import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAllowedVideoSource } from '@/lib/video-source'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const video = await db.video.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            banner: true,
            bio: true,
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
        _count: {
          select: {
            comments: true,
            likedBy: true,
            dislikedBy: true,
          },
        },
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }
    if (!isAllowedVideoSource(video.videoUrl)) {
      return NextResponse.json({ error: 'Video source is not allowed' }, { status: 404 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const video = await db.video.findUnique({ where: { id } })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }
    if (!isAllowedVideoSource(video.videoUrl)) {
      return NextResponse.json({ error: 'Video source is not allowed' }, { status: 404 })
    }

    const updatedVideo = await db.video.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({
      video: updatedVideo,
      message: 'View count incremented',
    })
  } catch (error) {
    console.error('Error incrementing views:', error)
    return NextResponse.json(
      { error: 'Failed to increment views' },
      { status: 500 }
    )
  }
}
