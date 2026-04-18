import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

type DailyPoint = {
  date: string
  label: string
  uploads: number
  comments: number
  views: number
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function toLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const days = Math.max(7, Math.min(90, parseInt(searchParams.get('days') || '14', 10)))

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(today)
    start.setDate(start.getDate() - (days - 1))

    const [videos, comments] = await Promise.all([
      db.video.findMany({
        where: { createdAt: { gte: start } },
        select: {
          id: true,
          createdAt: true,
          views: true,
        },
      }),
      db.comment.findMany({
        where: { createdAt: { gte: start } },
        select: {
          id: true,
          createdAt: true,
        },
      }),
    ])

    const pointsMap = new Map<string, DailyPoint>()
    for (let i = 0; i < days; i += 1) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      const key = dayKey(date)
      pointsMap.set(key, {
        date: key,
        label: toLabel(date),
        uploads: 0,
        comments: 0,
        views: 0,
      })
    }

    videos.forEach((video) => {
      const key = dayKey(video.createdAt)
      const point = pointsMap.get(key)
      if (!point) return
      point.uploads += 1
      point.views += video.views
    })

    comments.forEach((comment) => {
      const key = dayKey(comment.createdAt)
      const point = pointsMap.get(key)
      if (!point) return
      point.comments += 1
    })

    const points = Array.from(pointsMap.values())
    return NextResponse.json({
      days,
      points,
    })
  } catch (error) {
    console.error('Error fetching admin analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

