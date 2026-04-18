import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching admin categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const rawName = typeof body?.name === 'string' ? body.name.trim() : ''
    const rawSlug = typeof body?.slug === 'string' ? body.slug.trim() : ''

    if (!rawName) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const slug = slugify(rawSlug || rawName)
    if (!slug) {
      return NextResponse.json({ error: 'Invalid category slug' }, { status: 400 })
    }

    const created = await db.category.create({
      data: {
        name: rawName,
        slug,
      },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    })

    return NextResponse.json({ category: created }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin category:', error)
    return NextResponse.json(
      { error: 'Failed to create category (name or slug may already exist)' },
      { status: 400 }
    )
  }
}

