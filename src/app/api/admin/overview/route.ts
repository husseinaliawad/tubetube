import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [
      totalVideos,
      publishedVideos,
      draftVideos,
      totalUsers,
      totalComments,
      totalCategories,
      totalViewsAgg,
      recentVideos,
      recentComments,
      topCategoriesRaw,
      topCreatorsRaw,
    ] = await Promise.all([
      db.video.count(),
      db.video.count({ where: { isPublished: true } }),
      db.video.count({ where: { isPublished: false } }),
      db.user.count(),
      db.comment.count(),
      db.category.count(),
      db.video.aggregate({ _sum: { views: true } }),
      db.video.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              handle: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      db.comment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
            },
          },
          video: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      db.video.groupBy({
        by: ['categoryId'],
        where: { categoryId: { not: null } },
        _count: { categoryId: true },
        orderBy: {
          _count: {
            categoryId: 'desc',
          },
        },
        take: 6,
      }),
      db.video.groupBy({
        by: ['uploaderId'],
        _count: { uploaderId: true },
        _sum: { views: true },
        orderBy: {
          _sum: {
            views: 'desc',
          },
        },
        take: 6,
      }),
    ])

    const categoryIds = topCategoriesRaw
      .map((item) => item.categoryId)
      .filter((id): id is string => Boolean(id))

    const creatorIds = topCreatorsRaw.map((item) => item.uploaderId)

    const [categories, creators] = await Promise.all([
      db.category.findMany({
        where: {
          id: { in: categoryIds },
        },
      }),
      db.user.findMany({
        where: {
          id: { in: creatorIds },
        },
        select: {
          id: true,
          name: true,
          handle: true,
          subscribers: true,
        },
      }),
    ])

    const categoryMap = new Map(categories.map((c) => [c.id, c]))
    const creatorMap = new Map(creators.map((c) => [c.id, c]))

    const topCategories = topCategoriesRaw
      .map((item) => {
        const category = categoryMap.get(item.categoryId || '')
        if (!category) return null
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          videos: item._count.categoryId,
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))

    const topCreators = topCreatorsRaw
      .map((item) => {
        const creator = creatorMap.get(item.uploaderId)
        if (!creator) return null
        return {
          id: creator.id,
          name: creator.name,
          handle: creator.handle,
          subscribers: creator.subscribers,
          videos: item._count.uploaderId,
          totalViews: item._sum.views ?? 0,
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))

    return NextResponse.json({
      stats: {
        totalVideos,
        publishedVideos,
        draftVideos,
        totalUsers,
        totalComments,
        totalCategories,
        totalViews: totalViewsAgg._sum.views ?? 0,
      },
      recentVideos,
      recentComments,
      topCategories,
      topCreators,
    })
  } catch (error) {
    console.error('Error fetching admin overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin overview' },
      { status: 500 }
    )
  }
}
