import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

type UserAction = 'suspendContent' | 'restoreContent'

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
    const action = body?.action as UserAction | undefined

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'suspendContent') {
      await db.video.updateMany({
        where: { uploaderId: id },
        data: {
          isPublished: false,
          privacy: 'private',
        },
      })
    } else if (action === 'restoreContent') {
      await db.video.updateMany({
        where: { uploaderId: id },
        data: {
          isPublished: true,
          privacy: 'public',
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user content status:', error)
    return NextResponse.json(
      { error: 'Failed to update user content status' },
      { status: 500 }
    )
  }
}

