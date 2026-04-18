import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const comment = await db.comment.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const levels: string[][] = []
    let currentLevel = [id]
    while (currentLevel.length > 0) {
      levels.push(currentLevel)
      const children = await db.comment.findMany({
        where: { parentId: { in: currentLevel } },
        select: { id: true },
      })
      currentLevel = children.map((child) => child.id)
    }

    for (let i = levels.length - 1; i >= 0; i -= 1) {
      await db.comment.deleteMany({
        where: {
          id: { in: levels[i] },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

