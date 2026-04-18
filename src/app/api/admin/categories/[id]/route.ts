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

    const name = typeof body?.name === 'string' ? body.name.trim() : undefined
    const slugInput = typeof body?.slug === 'string' ? body.slug.trim() : undefined

    if (!name && !slugInput) {
      return NextResponse.json(
        { error: 'Name or slug is required' },
        { status: 400 }
      )
    }

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const slug = slugInput ? slugify(slugInput) : undefined
    if (slugInput && !slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    const updated = await db.category.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(slug ? { slug } : {}),
      },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    })

    return NextResponse.json({ category: updated })
  } catch (error) {
    console.error('Error updating admin category:', error)
    return NextResponse.json(
      { error: 'Failed to update category (name or slug may already exist)' },
      { status: 400 }
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

    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category._count.videos > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that still has scenes' },
        { status: 400 }
      )
    }

    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}

