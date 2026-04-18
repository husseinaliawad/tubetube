import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [categories, creators] = await Promise.all([
      db.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { name: 'asc' },
      }),
      db.user.findMany({
        select: {
          id: true,
          name: true,
          handle: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({ categories, creators })
  } catch (error) {
    console.error('Error fetching admin meta:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin meta' },
      { status: 500 }
    )
  }
}

