/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const COUNT = Math.max(1, Number(process.argv[2] || 20))
const START_PAGE = Math.max(1, Number(process.argv[3] || 1))

function toPathPrefix(videoId) {
  const idNum = Number(videoId)
  return `${1_000_000 * Math.floor(idNum / 1_000_000)}/${1_000 * Math.floor(idNum / 1_000)}`
}

function toSeconds(duration) {
  if (!duration) return 0
  const parts = String(duration).split(':').map((v) => Number(v))
  if (parts.some((v) => Number.isNaN(v))) return 0
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

function pickCategorySlug(title = '', categories = {}) {
  const text = `${title} ${Object.values(categories).map((c) => c?.title || '').join(' ')}`.toLowerCase()
  if (/lesbian|sapphic/.test(text)) return 'lesbian'
  if (/milf/.test(text)) return 'milf'
  if (/pov/.test(text)) return 'pov'
  if (/bdsm|bondage|dom/.test(text)) return 'bdsm'
  if (/couple|threesome|3some/.test(text)) return 'couples'
  return 'amateur'
}

async function fetchLatestPage(page) {
  const url = `https://fuxxx.com/api/json/videos2/86400/str/latest-updates/24/.0.${page}.all...json`
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      referer: 'https://fuxxx.com/',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed list page ${page}: ${res.status}`)
  }

  const data = await res.json()
  return Array.isArray(data.videos) ? data.videos : []
}

async function fetchVideoDetails(videoId) {
  const prefix = toPathPrefix(videoId)
  const apiUrl = `https://fuxxx.com/api/json/video/86400/${prefix}/${videoId}.json`

  const res = await fetch(apiUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      referer: `https://fuxxx.com/videos/${videoId}/`,
    },
  })

  if (!res.ok) {
    throw new Error(`Failed details ${videoId}: ${res.status}`)
  }

  const data = await res.json()
  return data.video
}

async function ensureCategories() {
  const needed = [
    ['Amateur', 'amateur'],
    ['POV', 'pov'],
    ['MILF', 'milf'],
    ['Couples', 'couples'],
    ['BDSM', 'bdsm'],
    ['Lesbian', 'lesbian'],
  ]

  for (const [name, slug] of needed) {
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    })
  }
}

async function run() {
  await ensureCategories()

  const uploader =
    (await prisma.user.findFirst({ where: { handle: 'cityamateurs' } })) ||
    (await prisma.user.findFirst())

  if (!uploader) {
    throw new Error('No uploader user found in DB')
  }

  const candidates = []
  let page = START_PAGE

  while (candidates.length < COUNT) {
    const list = await fetchLatestPage(page)
    if (list.length === 0) break

    for (const item of list) {
      if (item?.video_id) candidates.push(String(item.video_id))
      if (candidates.length >= COUNT) break
    }

    page += 1
  }

  const uniqueIds = Array.from(new Set(candidates)).slice(0, COUNT)
  let created = 0
  let updated = 0
  let skipped = 0

  for (const videoId of uniqueIds) {
    const embedUrl = `https://fuxxx.com/embed/${videoId}`

    const existing = await prisma.video.findFirst({
      where: {
        OR: [
          { videoUrl: embedUrl },
          { description: { contains: `/videos/${videoId}/` } },
        ],
      },
      select: { id: true },
    })

    const remote = await fetchVideoDetails(videoId)
    if (!remote?.title) {
      skipped += 1
      continue
    }

    const categorySlug = pickCategorySlug(remote.title, remote.categories)
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })

    const tags = Object.values(remote.tags || {})
      .map((t) => String(t?.title || '').trim())
      .filter(Boolean)
      .slice(0, 20)

    const sourceLink = `https://fuxxx.com/videos/${videoId}/${remote.dir || ''}/`

    const data = {
      title: String(remote.title).replace(/\s+/g, ' ').trim(),
      description: [String(remote.description || '').trim(), `Source: ${sourceLink}`]
        .filter(Boolean)
        .join('\n\n'),
      thumbnailUrl: remote.thumbsrc || remote.thumb || '',
      videoUrl: embedUrl,
      duration: toSeconds(remote.duration),
      views: Number(remote.statistics?.viewed || 0) || 0,
      likes: Number(remote.statistics?.likes || 0) || 0,
      dislikes: Number(remote.statistics?.dislikes || 0) || 0,
      isPublished: true,
      privacy: 'public',
      isShort: false,
      uploaderId: uploader.id,
      categoryId: category?.id || null,
    }

    if (!data.thumbnailUrl) {
      skipped += 1
      continue
    }

    if (existing) {
      await prisma.videoTag.deleteMany({ where: { videoId: existing.id } })
      await prisma.video.update({
        where: { id: existing.id },
        data: {
          ...data,
          tags: { create: tags.map((name) => ({ name })) },
        },
      })
      updated += 1
    } else {
      await prisma.video.create({
        data: {
          ...data,
          tags: { create: tags.map((name) => ({ name })) },
        },
      })
      created += 1
    }

    console.log(`synced video ${videoId}`)
  }

  const total = await prisma.video.count()
  console.log(`done: created=${created}, updated=${updated}, skipped=${skipped}, total=${total}`)
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
