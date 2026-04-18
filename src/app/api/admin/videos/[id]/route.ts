import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const action = body?.action as string | undefined

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    const video = await db.video.findUnique({ where: { id } })
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}

    if (action === 'publish') data.isPublished = true
    else if (action === 'unpublish') data.isPublished = false
    else if (action === 'makePublic') data.privacy = 'public'
    else if (action === 'makePrivate') data.privacy = 'private'
    else if (action === 'makeUnlisted') data.privacy = 'unlisted'
    else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const updated = await db.video.update({
      where: { id },
      data,
    })

    return NextResponse.json({ video: updated })
  } catch (error) {
    console.error('Error updating admin video:', error)
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const video = await db.video.findUnique({ where: { id } })
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    await db.$transaction([
      db.playlistItem.deleteMany({ where: { videoId: id } }),
      db.videoLike.deleteMany({ where: { videoId: id } }),
      db.videoDislike.deleteMany({ where: { videoId: id } }),
      db.comment.deleteMany({ where: { videoId: id } }),
      db.videoTag.deleteMany({ where: { videoId: id } }),
      db.video.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
