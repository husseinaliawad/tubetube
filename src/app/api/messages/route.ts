import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const comments = await db.comment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        user: {
          select: {
            name: true,
            handle: true,
            avatar: true,
          },
        },
        video: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ messages: comments })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
