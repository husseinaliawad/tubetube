/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const sourceLinks = [
  'https://fuxxx.com/videos/2098379/two-amateur-stepsisters-have-hot-threesome-with-old-man-in-his-bedroom/',
  'https://fuxxx.com/videos/1930627/young-brunette-gets-some-old-man-cock-in-her-tight-pussy/',
  'https://fuxxx.com/videos/1998858/super-beautiful-teen-18-fucks-super-old-man/',
  'https://fuxxx.com/videos/1636192/nude-teen-18-and-old-man-hot-sex-story/',
  'https://fuxxx.com/videos/1699076/danielle-sou-and-linda-leclair-fuck-old-man/',
  'https://fuxxx.com/videos/1397462/hot-blowjob-cumshot-compilation-girl-sucking-old-man-dick/',
  'https://fuxxx.com/videos/1595083/russian-sluts-and-old-man-3-some-sex/',
  'https://fuxxx.com/videos/1954895/old-vs-y-takes-facial-cumshot-and-swallows-cum-after-having-hardcore-sex-with-old-man-because-she-was-horny-and-her-pussy/',
  'https://fuxxx.com/videos/1199463/teen-18-teaching-old-man-to-dance/',
  'https://fuxxx.com/videos/1513714/old-man-young-desire/',
  'https://fuxxx.com/videos/1669069/ukranian-alexa-libertin-fucks-old-man/',
  'https://fuxxx.com/videos/2098202/black-girl-has-hardcore-sex-with-old-man-cock/',
  'https://fuxxx.com/videos/1673140/filthy-outdoor-3some-sex-with-french-old-man2/',
]

function extractVideoId(url) {
  const m = url.match(/\/videos\/(\d+)\//i)
  return m?.[1] || null
}

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

async function fetchRemoteVideo(videoId) {
  const prefix = toPathPrefix(videoId)
  const apiUrl = `https://fuxxx.com/api/json/video/86400/${prefix}/${videoId}.json`

  const res = await fetch(apiUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      referer: `https://fuxxx.com/videos/${videoId}/`,
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch ${videoId}: ${res.status}`)
  }

  const data = await res.json()
  return data.video
}

async function run() {
  const user =
    (await prisma.user.findFirst({ where: { handle: 'cityamateurs' } })) ||
    (await prisma.user.findFirst())

  if (!user) {
    throw new Error('No uploader user found in DB')
  }

  const importedIds = []

  for (const link of sourceLinks) {
    const sourceId = extractVideoId(link)
    if (!sourceId) continue

    const remote = await fetchRemoteVideo(sourceId)
    if (!remote?.title) continue

    const categorySlug = pickCategorySlug(remote.title, remote.categories)
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })

    const tags = Object.values(remote.tags || {})
      .map((t) => String(t?.title || '').trim())
      .filter(Boolean)
      .slice(0, 20)

    const title = remote.title.replace(/\s+/g, ' ').trim()
    const thumbnailUrl = remote.thumbsrc || remote.thumb || ''
    const embedUrl = `https://fuxxx.com/embed/${sourceId}`

    if (!thumbnailUrl) {
      console.log(`skip ${sourceId}: missing thumbnail`)
      continue
    }

    const existing = await prisma.video.findFirst({
      where: {
        OR: [{ title }, { videoUrl: embedUrl }, { videoUrl: link }],
      },
      select: { id: true },
    })

    const payload = {
      title,
      description: [remote.description || '', `Source: ${link}`].filter(Boolean).join('\n\n'),
      thumbnailUrl,
      videoUrl: embedUrl,
      duration: toSeconds(remote.duration),
      views: Number(remote.statistics?.viewed || 0) || 0,
      likes: Number(remote.statistics?.likes || 0) || 0,
      dislikes: Number(remote.statistics?.dislikes || 0) || 0,
      isPublished: true,
      privacy: 'public',
      isShort: false,
      uploaderId: user.id,
      categoryId: category?.id || null,
    }

    let saved
    if (existing) {
      await prisma.videoTag.deleteMany({ where: { videoId: existing.id } })
      saved = await prisma.video.update({
        where: { id: existing.id },
        data: {
          ...payload,
          tags: {
            create: tags.map((name) => ({ name })),
          },
        },
        select: { id: true, title: true },
      })
    } else {
      saved = await prisma.video.create({
        data: {
          ...payload,
          tags: {
            create: tags.map((name) => ({ name })),
          },
        },
        select: { id: true, title: true },
      })
    }

    importedIds.push(saved.id)
    console.log(`imported: ${saved.title}`)
  }

  // Remove dummy/seed scenes but keep imported/current real ones.
  const toDelete = await prisma.video.findMany({
    where: {
      AND: [
        {
          OR: [
            { videoUrl: { contains: 'example.com' } },
            { thumbnailUrl: { contains: 'picsum.photos' } },
          ],
        },
        { id: { notIn: importedIds } },
      ],
    },
    select: { id: true },
  })

  const deleteIds = toDelete.map((v) => v.id)

  if (deleteIds.length) {
    await prisma.playlistItem.deleteMany({ where: { videoId: { in: deleteIds } } })
    await prisma.videoLike.deleteMany({ where: { videoId: { in: deleteIds } } })
    await prisma.videoDislike.deleteMany({ where: { videoId: { in: deleteIds } } })
    await prisma.comment.deleteMany({ where: { videoId: { in: deleteIds } } })
    await prisma.videoTag.deleteMany({ where: { videoId: { in: deleteIds } } })
    await prisma.video.deleteMany({ where: { id: { in: deleteIds } } })
  }

  const total = await prisma.video.count()
  console.log(`done. imported=${importedIds.length} deleted_dummy=${deleteIds.length} total_videos=${total}`)
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
